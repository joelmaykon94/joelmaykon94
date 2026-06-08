import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ClassConfiguration } from './class-configuration';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ClassConfiguration', () => {
  let component: ClassConfiguration;
  let fixture: ComponentFixture<ClassConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClassConfiguration]
    }).compileComponents();

    fixture = TestBed.createComponent(ClassConfiguration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with SINGLE_CLASS structure type and 1 default class', () => {
    expect(component.structureType()).toBe('SINGLE_CLASS');
    const classes = component.classesList();
    expect(classes.length).toBe(1);
    expect(classes[0].name).toContain('Principal');
    expect(component.activeClassIndex()).toBe(0);
  });

  it('should switch to MULTI_CLASS and dynamically add a second class', () => {
    component.setStructureType('MULTI_CLASS');
    expect(component.structureType()).toBe('MULTI_CLASS');
    
    const classes = component.classesList();
    expect(classes.length).toBe(2);
    expect(classes[0].name).toContain('Principal');
    expect(classes[1].name).toContain('Varejo');
    expect(component.activeClassIndex()).toBe(1);
  });

  it('should add a custom class up to 3 classes', () => {
    component.setStructureType('MULTI_CLASS'); // Has 2 classes
    component.addClass(); // Adds 3rd class

    const classes = component.classesList();
    expect(classes.length).toBe(3);
    expect(classes[2].name).toContain('Institucional');
    expect(component.activeClassIndex()).toBe(2);

    // Try adding a 4th class - should be ignored
    component.addClass();
    expect(component.classesList().length).toBe(3);
  });

  it('should remove a class and adjust the active tab index', () => {
    component.setStructureType('MULTI_CLASS'); // Has 2 classes
    component.addClass(); // Has 3 classes (indices: 0, 1, 2)
    component.setActiveClass(2);

    expect(component.activeClassIndex()).toBe(2);

    component.removeClass(2); // Remove the 3rd class
    expect(component.classesList().length).toBe(2);
    expect(component.activeClassIndex()).toBe(1);
  });

  it('should validate custody fee percentages', () => {
    const active = component.activeClass;
    active.maxCustodyFee = 120.00; // Greater than 100%
    component.onFieldsChange();
    fixture.detectChanges();

    expect(component.isFormValid()).toBe(false);
    expect(component.validationErrors()[0]).toContain('Taxa de Custódia Máxima deve ser entre 0% e 100%');
  });

  it('should enforce validations for minimum remuneration when enabled', () => {
    // Enable minimum remuneration
    component.toggleMinimumRemuneration(0);
    fixture.detectChanges();

    // Defaults are set: amount 1000.00, index CDI
    expect(component.isFormValid()).toBe(true);

    // Set invalid amount
    component.activeClass.minRemunerationAmount = -50.00;
    component.onFieldsChange();
    fixture.detectChanges();
    expect(component.isFormValid()).toBe(false);
    expect(component.validationErrors()[0]).toContain('Valor da Remuneração Mínima deve ser maior que R$ 0,00');

    // Set null economic index
    component.activeClass.minRemunerationAmount = 500.00;
    component.activeClass.economicIndex = null as any;
    component.onFieldsChange();
    fixture.detectChanges();
    expect(component.isFormValid()).toBe(false);
    expect(component.validationErrors()[0]).toContain('Índice Econômico de correção é obrigatório');
  });

  it('should trigger saving simulation on valid configuration', () => {
    expect(component.isFormValid()).toBe(true);
    component.saveConfiguration();
    expect(component.isSaving()).toBe(true);
  });
});
