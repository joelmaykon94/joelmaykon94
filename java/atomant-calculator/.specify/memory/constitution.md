# Project Constitution & Engineering Principles: `atomant-calculator` (Calculator Module)

This constitution establishes the core, non-negotiable mathematical, precision, and business calculation rules for the **Calculator Module**. All contributors, calculations, and tests must adhere to these policies to prevent financial rounding discrepancies and data loss.

---

## 1. Core Mathematical & Rounding Standards

To prevent rounding errors in large financial transactions and asset valuations, the following rules apply:
1. **No Float/Double Types**: Floating-point primitives (`float`, `double`) and their wrappers (`Float`, `Double`) are strictly forbidden for money, shares, fees, or split ratios.
2. **Java BigDecimal**: All calculations must use `java.math.BigDecimal` exclusively.
3. **Rounding Mode**: All rounding operations must use **`RoundingMode.HALF_EVEN`** (Banker's rounding). This reduces cumulative rounding bias over large numbers of records.
4. **Precision Standards**:
   * **Daily Fund Fee**: Rounded to **4 decimal places**.
   * **Quota Holder Representation Ratio**: Maintained at **8 decimal places** to capture minute ownership splits.
   * **Pro-rata Fee Apportionment**: Rounded to **4 decimal places** (then converted to 2 decimal places in final user presentation layers if needed).

---

## 2. Business Rules & Formulas

### 2.1 Rule 1: Fee Diarization
The annual management fee must be diarized daily based on a 252-business-day calendar convention.
$$\text{Daily Fund Fee} = \frac{\text{Fund Daily PL} \times \text{Annual Fee Rate}}{252}$$
* **Implementation Standard**:
  ```java
  BigDecimal dailyFee = netAssetValue
      .multiply(annualFeeRate)
      .divide(BigDecimal.valueOf(252), 4, RoundingMode.HALF_EVEN);
  ```

### 2.2 Rule 2: Quota Holder Representation
The ownership ratio of a quota holder relative to the fund is calculated by dividing their current position (owned quotas) by the fund's total daily net quotas.
$$\text{Representation} = \frac{\text{Holder Owned Quotas}}{\text{Fund Total Quotas}}$$
* **Implementation Standard**:
  ```java
  BigDecimal representation = holderQuotas
      .divide(totalFundQuotas, 8, RoundingMode.HALF_EVEN);
  ```

### 2.3 Rule 3: Pro-rata Fee Apportionment
The daily patrimonial fee charged to a specific quota holder is the product of their representation ratio and the total daily fund fee.
$$\text{Pro-rata Fee Apportionment} = \text{Representation} \times \text{Daily Fund Fee}$$
* **Implementation Standard**:
  ```java
  BigDecimal proratedFee = representation
      .multiply(dailyFundFee)
      .setScale(4, RoundingMode.HALF_EVEN);
  ```

---

## 3. Structural Layers & Package Conventions

* **`org.acme.calculator.api`**: Exposes stateless REST resources taking batch calculation requests.
* **`org.acme.calculator.domain.model`**: Defines pure domain records like `CalculationRequest` and `CalculationResponse`.
* **`org.acme.calculator.domain.service`**: Houses the stateless service implementation applying the three formulas.
