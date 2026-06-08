import { TestBed, ComponentFixture } from '@angular/core/testing';
import { PortfolioComposition } from './portfolio-composition';
import { describe, it, expect, beforeEach } from 'vitest';

describe('PortfolioComposition', () => {
  let component: PortfolioComposition;
  let fixture: ComponentFixture<PortfolioComposition>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioComposition]
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioComposition);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with Fixed Income type by default and preload groups', () => {
    expect(component.selectedType()).toBe('fixed_income');
    const groups = component.activeGroups();
    expect(groups.length).toBe(3);
    
    // First group should be expanded, others collapsed by default
    expect(groups[0].isExpanded).toBe(true);
    expect(groups[1].isExpanded).toBe(false);
    expect(groups[2].isExpanded).toBe(false);

    // Verify first group assets preloaded
    expect(groups[0].name).toBe('Títulos Públicos');
    expect(groups[0].assets.length).toBe(3);
    expect(groups[0].assets[0].name).toBe('LFT (Tesouro Selic)');
  });

  it('should load assets correctly when switching portfolio type', () => {
    component.selectPortfolioType('equities');
    expect(component.selectedType()).toBe('equities');

    const groups = component.activeGroups();
    expect(groups.length).toBe(3);
    expect(groups[0].name).toBe('Ações - Blue Chips');
    expect(groups[0].assets.length).toBe(3);
    expect(groups[0].assets[0].name).toBe('Vale (VALE3)');
  });

  it('should toggle group expansion', () => {
    const groups = component.activeGroups();
    const firstGroupId = groups[0].id;
    
    expect(groups[0].isExpanded).toBe(true);
    component.toggleGroup(firstGroupId);
    
    const updatedGroups = component.activeGroups();
    expect(updatedGroups[0].isExpanded).toBe(false);
  });

  it('should support bulk expand and collapse', () => {
    component.expandAll();
    let groups = component.activeGroups();
    expect(groups.every(g => g.isExpanded)).toBe(true);

    component.collapseAll();
    groups = component.activeGroups();
    expect(groups.every(g => !g.isExpanded)).toBe(true);
  });

  it('should add asset rows inside a group and keep non-blocking sums', () => {
    const groups = component.activeGroups();
    const firstGroupId = groups[0].id;
    const initialAssetCount = groups[0].assets.length;

    component.addAsset(firstGroupId);

    const updatedGroups = component.activeGroups();
    expect(updatedGroups[0].assets.length).toBe(initialAssetCount + 1);

    const newAsset = updatedGroups[0].assets[initialAssetCount];
    expect(newAsset.name).toBe('');
    expect(newAsset.minPercentage).toBe(0);
    expect(newAsset.maxPercentage).toBe(0);

    // Verify sums can exceed 100% and it is non-blocking
    newAsset.minPercentage = 60;
    newAsset.maxPercentage = 90;
    
    const sum = component.summary();
    expect(sum.totalMinSum).toBeGreaterThan(100);
    // Checks that warning is generated (if any) but no blocking state is created
    expect(component.isSaving()).toBe(false);
  });

  it('should remove asset rows inside a group', () => {
    const groups = component.activeGroups();
    const firstGroupId = groups[0].id;
    const targetAssetId = groups[0].assets[0].id;
    const initialAssetCount = groups[0].assets.length;

    component.removeAsset(firstGroupId, targetAssetId);

    const updatedGroups = component.activeGroups();
    expect(updatedGroups[0].assets.length).toBe(initialAssetCount - 1);
    expect(updatedGroups[0].assets.find(a => a.id === targetAssetId)).toBeUndefined();
  });

  it('should add and remove entire custom groups', () => {
    const initialGroupCount = component.activeGroups().length;
    component.addGroup();

    let groups = component.activeGroups();
    expect(groups.length).toBe(initialGroupCount + 1);
    const customGroup = groups[groups.length - 1];
    expect(customGroup.name).toBe('Novo Grupo Customizado');

    component.removeGroup(customGroup.id);
    groups = component.activeGroups();
    expect(groups.length).toBe(initialGroupCount);
  });

  it('should reset current portfolio template to its original default values', () => {
    const groups = component.activeGroups();
    const firstGroupId = groups[0].id;
    component.removeAsset(firstGroupId, groups[0].assets[0].id);

    expect(component.activeGroups()[0].assets.length).toBe(2);

    component.resetToDefaults();
    expect(component.activeGroups()[0].assets.length).toBe(3);
  });

  it('should detect warnings when min limit is greater than max limit', () => {
    const groups = component.activeGroups();
    // Intentionally make min > max
    groups[0].assets[0].minPercentage = 50;
    groups[0].assets[0].maxPercentage = 20;

    component.activeGroups.set([...groups]);

    const sum = component.summary();
    expect(sum.warnings.length).toBeGreaterThan(0);
    expect(sum.warnings[0]).toContain('valor mínimo (50%) é maior que o valor máximo (20%)');
  });
});
