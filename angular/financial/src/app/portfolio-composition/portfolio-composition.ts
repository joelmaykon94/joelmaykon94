import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronDown, ChevronUp, Plus, Trash2, RotateCcw, Info, AlertTriangle, FolderPlus, Check, Sliders } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';

export interface Asset {
  id: string;
  name: string;
  minPercentage: number;
  maxPercentage: number;
}

export interface AssetGroup {
  id: string;
  name: string;
  maxModalPercentage: number;
  assets: Asset[];
  isExpanded: boolean;
}

export type PortfolioType = 'fixed_income' | 'equities' | 'multi_market' | 'fx';

export interface PortfolioTypeInfo {
  id: PortfolioType;
  name: string;
}

const DEFAULT_PORTFOLIOS: Record<PortfolioType, { name: string; groups: Omit<AssetGroup, 'isExpanded'>[] }> = {
  fixed_income: {
    name: 'Renda Fixa',
    groups: [
      {
        id: 'fi_gov',
        name: 'Títulos Públicos',
        maxModalPercentage: 80,
        assets: [
          { id: 'fi_gov_1', name: 'LFT (Tesouro Selic)', minPercentage: 20, maxPercentage: 60 },
          { id: 'fi_gov_2', name: 'LTN (Tesouro Pré-fixado)', minPercentage: 10, maxPercentage: 40 },
          { id: 'fi_gov_3', name: 'NTN-B (Tesouro IPCA+)', minPercentage: 10, maxPercentage: 50 }
        ]
      },
      {
        id: 'fi_corp',
        name: 'Crédito Privado',
        maxModalPercentage: 40,
        assets: [
          { id: 'fi_corp_1', name: 'Debêntures Incentivadas', minPercentage: 5, maxPercentage: 25 },
          { id: 'fi_corp_2', name: 'CRI / CRA', minPercentage: 0, maxPercentage: 20 }
        ]
      },
      {
        id: 'fi_bank',
        name: 'Crédito Bancário',
        maxModalPercentage: 30,
        assets: [
          { id: 'fi_bank_1', name: 'CDB Pós-Fixado', minPercentage: 5, maxPercentage: 30 }
        ]
      }
    ]
  },
  equities: {
    name: 'Renda Variável',
    groups: [
      {
        id: 'eq_blue',
        name: 'Ações - Blue Chips',
        maxModalPercentage: 70,
        assets: [
          { id: 'eq_blue_1', name: 'Vale (VALE3)', minPercentage: 5, maxPercentage: 20 },
          { id: 'eq_blue_2', name: 'Petrobras (PETR4)', minPercentage: 5, maxPercentage: 15 },
          { id: 'eq_blue_3', name: 'Itaú (ITUB4)', minPercentage: 5, maxPercentage: 15 }
        ]
      },
      {
        id: 'eq_small',
        name: 'Ações - Small & Mid Caps',
        maxModalPercentage: 30,
        assets: [
          { id: 'eq_small_1', name: 'Localiza (RENT3)', minPercentage: 0, maxPercentage: 15 },
          { id: 'eq_small_2', name: 'WEG (WEGE3)', minPercentage: 0, maxPercentage: 15 }
        ]
      },
      {
        id: 'eq_fii',
        name: 'Fundos Imobiliários (FIIs)',
        maxModalPercentage: 25,
        assets: [
          { id: 'eq_fii_1', name: 'Kinea Rendimentos (KNIP11)', minPercentage: 0, maxPercentage: 10 },
          { id: 'eq_fii_2', name: 'CSHG Logística (HGLG11)', minPercentage: 0, maxPercentage: 10 }
        ]
      }
    ]
  },
  multi_market: {
    name: 'Multimercado',
    groups: [
      {
        id: 'mm_macro',
        name: 'Estratégia Macro',
        maxModalPercentage: 60,
        assets: [
          { id: 'mm_macro_1', name: 'Juros Direcional', minPercentage: 10, maxPercentage: 40 },
          { id: 'mm_macro_2', name: 'Arbitragem de Taxas', minPercentage: 5, maxPercentage: 30 }
        ]
      },
      {
        id: 'mm_hedge',
        name: 'Equity Hedge & Long/Short',
        maxModalPercentage: 40,
        assets: [
          { id: 'mm_hedge_1', name: 'Long & Short (Ações)', minPercentage: 0, maxPercentage: 25 },
          { id: 'mm_hedge_2', name: 'Long Biased', minPercentage: 0, maxPercentage: 20 }
        ]
      },
      {
        id: 'mm_deriv',
        name: 'Derivativos e Futuros',
        maxModalPercentage: 20,
        assets: [
          { id: 'mm_deriv_1', name: 'Futuros de Dólar', minPercentage: 0, maxPercentage: 10 },
          { id: 'mm_deriv_2', name: 'Futuros de Ouro', minPercentage: 0, maxPercentage: 10 }
        ]
      }
    ]
  },
  fx: {
    name: 'Cambial (FX)',
    groups: [
      {
        id: 'fx_g10',
        name: 'Moedas G10',
        maxModalPercentage: 90,
        assets: [
          { id: 'fx_g10_1', name: 'Dólar Americano (USD)', minPercentage: 30, maxPercentage: 80 },
          { id: 'fx_g10_2', name: 'Euro (EUR)', minPercentage: 10, maxPercentage: 40 },
          { id: 'fx_g10_3', name: 'Iene Japonês (JPY)', minPercentage: 0, maxPercentage: 15 }
        ]
      },
      {
        id: 'fx_em',
        name: 'Moedas Emergentes',
        maxModalPercentage: 30,
        assets: [
          { id: 'fx_em_1', name: 'Real Brasileiro (BRL)', minPercentage: 0, maxPercentage: 20 },
          { id: 'fx_em_2', name: 'Peso Mexicano (MXN)', minPercentage: 0, maxPercentage: 10 }
        ]
      },
      {
        id: 'fx_hedge',
        name: 'Hedge Cambial',
        maxModalPercentage: 50,
        assets: [
          { id: 'fx_hedge_1', name: 'Swap Cambial', minPercentage: 5, maxPercentage: 40 }
        ]
      }
    ]
  }
};

@Component({
  selector: 'app-portfolio-composition',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule,
    BaseChartDirective
  ],
  templateUrl: './portfolio-composition.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PortfolioComposition {
  constructor() {
    // Pick required icons for the component
    LucideAngularModule.pick({
      ChevronDown,
      ChevronUp,
      Plus,
      Trash2,
      RotateCcw,
      Info,
      AlertTriangle,
      FolderPlus,
      Check,
      Sliders
    });
  }

  // Expose icons to template
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly RotateCcw = RotateCcw;
  readonly Info = Info;
  readonly AlertTriangle = AlertTriangle;
  readonly FolderPlus = FolderPlus;
  readonly Check = Check;
  readonly Sliders = Sliders;

  // Selected Portfolio Type Signal
  readonly selectedType = signal<PortfolioType>('fixed_income');

  // Active Portfolio Groups Signal
  readonly activeGroups = signal<AssetGroup[]>(this.getInitialGroups('fixed_income'));

  // Saving states
  readonly isSaving = signal(false);
  readonly showSaveSuccess = signal(false);

  // Available Portfolio Types
  readonly portfolioTypes: PortfolioTypeInfo[] = [
    { id: 'fixed_income', name: 'Renda Fixa' },
    { id: 'equities', name: 'Renda Variável' },
    { id: 'multi_market', name: 'Multimercado' },
    { id: 'fx', name: 'Cambial' }
  ];

  // Helper to load and clone defaults
  private getInitialGroups(type: PortfolioType): AssetGroup[] {
    const defaultData = DEFAULT_PORTFOLIOS[type];
    return defaultData.groups.map((g, index) => ({
      ...g,
      isExpanded: index === 0, // Expand the first one by default
      assets: g.assets.map(a => ({ ...a }))
    }));
  }

  // Change active portfolio type template
  selectPortfolioType(type: PortfolioType): void {
    if (this.selectedType() === type) return;
    this.selectedType.set(type);
    this.activeGroups.set(this.getInitialGroups(type));
  }

  // Accordion Actions
  toggleGroup(groupId: string): void {
    this.activeGroups.update(groups => 
      groups.map(g => g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g)
    );
  }

  expandAll(): void {
    this.activeGroups.update(groups => 
      groups.map(g => ({ ...g, isExpanded: true }))
    );
  }

  collapseAll(): void {
    this.activeGroups.update(groups => 
      groups.map(g => ({ ...g, isExpanded: false }))
    );
  }

  // Add/Remove Assets inside groups
  addAsset(groupId: string): void {
    this.activeGroups.update(groups => 
      groups.map(g => {
        if (g.id === groupId) {
          const newAsset: Asset = {
            id: `asset_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            name: '',
            minPercentage: 0,
            maxPercentage: 0
          };
          return {
            ...g,
            isExpanded: true, // Make sure it is expanded when adding
            assets: [...g.assets, newAsset]
          };
        }
        return g;
      })
    );
  }

  removeAsset(groupId: string, assetId: string): void {
    this.activeGroups.update(groups => 
      groups.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            assets: g.assets.filter(a => a.id !== assetId)
          };
        }
        return g;
      })
    );
  }

  // Add/Remove entire Groups
  addGroup(): void {
    const newGroup: AssetGroup = {
      id: `group_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: 'Novo Grupo Customizado',
      maxModalPercentage: 100,
      assets: [],
      isExpanded: true
    };
    this.activeGroups.update(groups => [...groups, newGroup]);
  }

  removeGroup(groupId: string): void {
    this.activeGroups.update(groups => groups.filter(g => g.id !== groupId));
  }

  // Restore active template to default values
  resetToDefaults(): void {
    this.activeGroups.set(this.getInitialGroups(this.selectedType()));
  }

  // Save changes action simulation
  saveComposition(): void {
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.showSaveSuccess.set(true);
      setTimeout(() => {
        this.showSaveSuccess.set(false);
      }, 3000);
    }, 1200);
  }

  // Computed summary metrics and validations
  readonly summary = computed(() => {
    const groups = this.activeGroups();
    let totalAssetsCount = 0;
    let totalMinSum = 0;
    let totalMaxSum = 0;
    let totalMaxModalSum = 0;
    const warnings: string[] = [];

    groups.forEach(group => {
      totalAssetsCount += group.assets.length;
      totalMaxModalSum += group.maxModalPercentage || 0;
      
      let groupMinSum = 0;
      let groupMaxSum = 0;

      group.assets.forEach(asset => {
        const min = asset.minPercentage || 0;
        const max = asset.maxPercentage || 0;
        groupMinSum += min;
        groupMaxSum += max;

        if (min > max) {
          warnings.push(`[Ativo: ${asset.name || 'Sem Nome'}] O valor mínimo (${min}%) é maior que o valor máximo (${max}%).`);
        }
        if (min < 0 || min > 100) {
          warnings.push(`[Ativo: ${asset.name || 'Sem Nome'}] O valor mínimo (${min}%) deve estar entre 0% e 100%.`);
        }
        if (max < 0 || max > 100) {
          warnings.push(`[Ativo: ${asset.name || 'Sem Nome'}] O valor máximo (${max}%) deve estar entre 0% e 100%.`);
        }
      });

      totalMinSum += groupMinSum;
      totalMaxSum += groupMaxSum;

      if (group.maxModalPercentage < 0 || group.maxModalPercentage > 100) {
        warnings.push(`[Grupo: ${group.name}] O limite Max Modal (${group.maxModalPercentage}%) deve estar entre 0% e 100%.`);
      }

      if (groupMinSum > group.maxModalPercentage) {
        warnings.push(`[Grupo: ${group.name}] A soma dos mínimos dos ativos (${groupMinSum}%) excede o limite Max Modal do grupo (${group.maxModalPercentage}%).`);
      }
    });

    return {
      totalGroupsCount: groups.length,
      totalAssetsCount,
      totalMinSum,
      totalMaxSum,
      totalMaxModalSum,
      warnings
    };
  });

  // Dynamic calculations for individual group summary (collapsed display)
  getGroupSummary(group: AssetGroup) {
    const count = group.assets.length;
    const minSum = group.assets.reduce((s, a) => s + (a.minPercentage || 0), 0);
    const maxSum = group.assets.reduce((s, a) => s + (a.maxPercentage || 0), 0);
    
    const mins = group.assets.map(a => a.minPercentage || 0);
    const maxs = group.assets.map(a => a.maxPercentage || 0);
    
    const minMin = mins.length ? Math.min(...mins) : 0;
    const maxMin = mins.length ? Math.max(...mins) : 0;
    const minMax = maxs.length ? Math.min(...maxs) : 0;
    const maxMax = maxs.length ? Math.max(...maxs) : 0;

    return {
      count,
      minSum,
      maxSum,
      minRangeStr: mins.length ? `${minMin}% - ${maxMin}%` : '0%',
      maxRangeStr: maxs.length ? `${minMax}% - ${maxMax}%` : '0%'
    };
  }

  // Reactive chart definition for comparing limits
  readonly chartData = computed<ChartConfiguration<'bar'>['data']>(() => {
    const groups = this.activeGroups();
    
    const labels = groups.map(g => g.name || 'Sem nome');
    const maxModalData = groups.map(g => g.maxModalPercentage || 0);
    const minSumData = groups.map(g => g.assets.reduce((sum, a) => sum + (a.minPercentage || 0), 0));
    const maxSumData = groups.map(g => g.assets.reduce((sum, a) => sum + (a.maxPercentage || 0), 0));

    return {
      labels,
      datasets: [
        {
          label: 'Limite Modal Máximo',
          data: maxModalData,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          borderColor: '#ffffff',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Soma dos Limites Mínimos',
          data: minSumData,
          backgroundColor: 'rgba(134, 134, 139, 0.5)',
          borderColor: '#86868b',
          borderWidth: 1,
          borderRadius: 4
        },
        {
          label: 'Soma dos Limites Máximos',
          data: maxSumData,
          backgroundColor: 'rgba(134, 134, 139, 0.15)',
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          borderRadius: 4
        }
      ]
    };
  });

  // Chart styling matching the design system
  public readonly chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10 } }
      },
      x: {
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10 } }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: 'rgba(255, 255, 255, 0.6)', boxWidth: 10, font: { size: 10 } }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    }
  };
}
