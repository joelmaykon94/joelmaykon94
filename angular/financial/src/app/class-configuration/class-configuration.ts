import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, ChevronRight, Plus, Trash2, Check, Landmark, Users, Leaf, ShieldAlert, Sparkles, Sliders } from 'lucide-angular';

export interface FundClassModel {
  id: string;
  name: string;
  maxCustodyFee: number;
  hasMinimumRemuneration: boolean;
  minRemunerationAmount: number | null;
  economicIndex: string | null;
  esgCategory: string;
  targetAudience: string;
}

export type ClassStructureType = 'SINGLE_CLASS' | 'MULTI_CLASS';

@Component({
  selector: 'app-class-configuration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideAngularModule
  ],
  templateUrl: './class-configuration.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ClassConfiguration {
  constructor() {
    LucideAngularModule.pick({
      ChevronRight,
      Plus,
      Trash2,
      Check,
      Landmark,
      Users,
      Leaf,
      ShieldAlert,
      Sparkles,
      Sliders
    });
  }

  // Icons mapping for template
  readonly ChevronRight = ChevronRight;
  readonly Plus = Plus;
  readonly Trash2 = Trash2;
  readonly Check = Check;
  readonly Landmark = Landmark;
  readonly Users = Users;
  readonly Leaf = Leaf;
  readonly ShieldAlert = ShieldAlert;
  readonly Sparkles = Sparkles;
  readonly Sliders = Sliders;

  // State Signals
  readonly structureType = signal<ClassStructureType>('SINGLE_CLASS');
  readonly classesList = signal<FundClassModel[]>([this.createDefaultClass(1)]);
  readonly activeClassIndex = signal<number>(0);
  readonly isSaving = signal(false);
  readonly showSaveSuccess = signal(false);

  // Economic Indexes list
  readonly economicIndexes = [
    { code: 'CDI', name: 'CDI (% do CDI)' },
    { code: 'IPCA', name: 'IPCA (IPCA + Spread)' },
    { code: 'IGPM', name: 'IGP-M (IGP-M + Spread)' },
    { code: 'SELIC', name: 'SELIC (% da Selic)' }
  ];

  // ESG Categories list
  readonly esgCategories = [
    { code: 'NONE', name: 'Não se Aplica' },
    { code: 'ESG_INTEGRATION', name: 'Integração ESG' },
    { code: 'ESG_INVESTMENT', name: 'Investimento ESG' },
    { code: 'IMPACT_INVESTING', name: 'Investimento de Impacto' }
  ];

  // Target Audiences
  readonly targetAudiences = [
    { code: 'GENERAL', name: 'Público Geral' },
    { code: 'QUALIFIED', name: 'Investidor Qualificado' },
    { code: 'PROFESSIONAL', name: 'Investidor Profissional' }
  ];

  private createDefaultClass(index: number): FundClassModel {
    return {
      id: `class_${Date.now()}_${index}`,
      name: `Classe ${index === 1 ? 'Principal' : index === 2 ? 'Varejo' : 'Institucional'}`,
      maxCustodyFee: 0.1500,
      hasMinimumRemuneration: false,
      minRemunerationAmount: null,
      economicIndex: null,
      esgCategory: 'NONE',
      targetAudience: 'GENERAL'
    };
  }

  // Actions
  setStructureType(type: ClassStructureType): void {
    if (this.structureType() === type) return;
    this.structureType.set(type);
    
    if (type === 'SINGLE_CLASS') {
      // Keep only the first class
      this.classesList.update(list => [list[0]]);
      this.activeClassIndex.set(0);
    } else {
      // Add a second class if there is only one
      this.classesList.update(list => {
        if (list.length === 1) {
          return [list[0], this.createDefaultClass(2)];
        }
        return list;
      });
      this.activeClassIndex.set(1);
    }
  }

  setActiveClass(index: number): void {
    this.activeClassIndex.set(index);
  }

  addClass(): void {
    const currentList = this.classesList();
    if (currentList.length >= 3) return;
    
    this.classesList.update(list => [
      ...list,
      this.createDefaultClass(list.length + 1)
    ]);
    this.activeClassIndex.set(this.classesList().length - 1);
  }

  removeClass(index: number): void {
    const currentList = this.classesList();
    if (currentList.length <= 1) return;

    this.classesList.update(list => list.filter((_, i) => i !== index));
    
    // Adjust active index
    const newActiveIndex = Math.max(0, index - 1);
    this.activeClassIndex.set(newActiveIndex);
  }

  toggleMinimumRemuneration(index: number): void {
    this.classesList.update(list => 
      list.map((c, i) => {
        if (i === index) {
          const enabled = !c.hasMinimumRemuneration;
          return {
            ...c,
            hasMinimumRemuneration: enabled,
            minRemunerationAmount: enabled ? 1000.00 : null,
            economicIndex: enabled ? 'CDI' : null
          };
        }
        return c;
      })
    );
  }

  onFieldsChange(): void {
    this.classesList.set([...this.classesList()]);
  }

  saveConfiguration(): void {
    if (!this.isFormValid()) return;
    
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.showSaveSuccess.set(true);
      setTimeout(() => {
        this.showSaveSuccess.set(false);
      }, 3000);
    }, 1200);
  }

  // Active Class Getter
  get activeClass(): FundClassModel {
    return this.classesList()[this.activeClassIndex()];
  }

  // Validation Computations
  readonly validationErrors = computed(() => {
    const list = this.classesList();
    const errors: string[] = [];

    list.forEach((c, idx) => {
      const label = `Classe "${c.name || 'Sem Nome'}" (#${idx + 1})`;
      
      if (!c.name || c.name.trim().length === 0) {
        errors.push(`${label}: O nome da classe é obrigatório.`);
      }
      
      if (c.maxCustodyFee === null || c.maxCustodyFee === undefined) {
        errors.push(`${label}: Taxa de Custódia Máxima é obrigatória.`);
      } else if (c.maxCustodyFee < 0 || c.maxCustodyFee > 100) {
        errors.push(`${label}: Taxa de Custódia Máxima deve ser entre 0% e 100%.`);
      }

      if (c.hasMinimumRemuneration) {
        if (c.minRemunerationAmount === null || c.minRemunerationAmount === undefined) {
          errors.push(`${label}: Valor da Remuneração Mínima é obrigatório.`);
        } else if (c.minRemunerationAmount <= 0) {
          errors.push(`${label}: Valor da Remuneração Mínima deve ser maior que R$ 0,00.`);
        }
        
        if (!c.economicIndex) {
          errors.push(`${label}: Índice Econômico de correção é obrigatório.`);
        }
      }
    });

    return errors;
  });

  readonly isFormValid = computed(() => this.validationErrors().length === 0);

  // Helper to validate individual class status
  isClassValid(c: FundClassModel): boolean {
    if (!c.name || c.name.trim().length === 0) return false;
    if (c.maxCustodyFee === null || c.maxCustodyFee < 0 || c.maxCustodyFee > 100) return false;
    if (c.hasMinimumRemuneration) {
      if (c.minRemunerationAmount === null || c.minRemunerationAmount <= 0) return false;
      if (!c.economicIndex) return false;
    }
    return true;
  }
}
