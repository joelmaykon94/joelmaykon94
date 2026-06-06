import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LucideAngularModule, Home, Wallet, PieChart, Settings, Search, Bell, CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Send, Landmark } from 'lucide-angular';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LucideAngularModule, 
    BaseChartDirective, 
    CommonModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor() {
    // Pick icons for lucide-angular 1.0.0
    LucideAngularModule.pick({ 
      Home, Wallet, PieChart, Settings, Search, Bell, 
      CreditCard, ArrowUpRight, ArrowDownLeft, Plus, Send, Landmark 
    });
  }
  protected readonly title = signal('financial');

  // Icons for Sidebar
  readonly Home = Home;
  readonly Wallet = Wallet;
  readonly PieChart = PieChart;
  readonly Settings = Settings;
  readonly Search = Search;
  readonly Bell = Bell;
  readonly CreditCard = CreditCard;
  readonly ArrowUpRight = ArrowUpRight;
  readonly ArrowDownLeft = ArrowDownLeft;
  readonly Plus = Plus;
  readonly Send = Send;
  readonly Landmark = Landmark;

  // Dados do Gráfico (Fluxo de Caixa)
  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
    datasets: [
      {
        data: [1200, 1500, 800, 2100, 3200, 4500, 3900],
        label: 'Receitas',
        fill: true,
        tension: 0.4,
        borderColor: '#ffffff',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        pointBackgroundColor: '#ffffff',
      },
      {
        data: [800, 1200, 1100, 950, 1800, 2500, 2100],
        label: 'Despesas',
        fill: true,
        tension: 0.4,
        borderColor: '#86868b',
        backgroundColor: 'rgba(134, 134, 139, 0.1)',
        pointBackgroundColor: '#86868b',
      }
    ]
  };

  public lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { display: false },
      x: { 
        grid: { display: false },
        ticks: { color: 'rgba(255, 255, 255, 0.3)' }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: { 
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#ccc',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    }
  };

  // Mock de Transações Brasileiras
  transactions = [
    { name: 'Transferência PIX - Recebida', date: '01 Jun 2026', amount: '+R$ 2.500,00', category: 'Receita', status: 'Concluído' },
    { name: 'Pagamento Boleto - Enel', date: '31 Mai 2026', amount: '-R$ 185,40', category: 'Contas Fixas', status: 'Concluído' },
    { name: 'Rendimento FII (MXRF11)', date: '30 Mai 2026', amount: '+R$ 42,15', category: 'Investimentos', status: 'Concluído' },
    { name: 'Compra Mercado Livre', date: '28 Mai 2026', amount: '-R$ 349,90', category: 'Shopping', status: 'Concluído' },
    { name: 'Restaurante Sabor Brasil', date: '25 Mai 2026', amount: '-R$ 88,00', category: 'Alimentação', status: 'Concluído' },
    { name: 'Aporte CDB 110% CDI', date: '20 Mai 2026', amount: '-R$ 1.000,00', category: 'Investimentos', status: 'Processando' },
  ];
}
