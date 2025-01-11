import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../services/user.service';
import Chart from 'chart.js/auto';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('reportContainer', { static: true }) reportContainer!: ElementRef<HTMLDivElement>;

  startYear: number = new Date().getFullYear();
  startMonth: number = new Date().getMonth() + 1;
  endYear: number = new Date().getFullYear();
  endMonth: number = new Date().getMonth() + 1;

  loading: boolean = false;
  error: string | null = null;
  chart: Chart | null = null;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.fetchRevenueRange();
  }

  fetchRevenueRange(): void {
    this.loading = true;
    this.error = null;

    this.userService.getRevenueRange(this.startYear, this.startMonth, this.endYear, this.endMonth).subscribe({
      next: (data) => {
        this.updateChart(data.revenue);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to fetch revenue report. Please try again.';
        this.loading = false;
      }
    });
  }

  updateChart(revenueData: { year: number, month: number, totalRevenue: number }[]): void {
    if (this.chart) {
      this.chart.destroy(); // Destroy the existing chart if it exists
    }

    const ctx = this.chartCanvas.nativeElement.getContext('2d');

    const labels = revenueData.map(entry => `${entry.year}-${entry.month}`);
    const data = revenueData.map(entry => entry.totalRevenue);

    if (ctx) {
      this.chart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Total Revenue',
              data,
              backgroundColor: 'hsla(43, 91.20%, 50.80%, 0.45)',
              borderColor: 'rgb(252, 252, 252)',
              borderWidth: 1
            }
          ]
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      });
    }
  }

  onDateRangeChange(): void {
    this.fetchRevenueRange();
  }

  downloadReport(): void {
    console.log('Starting PDF generation...');
    const container = this.reportContainer.nativeElement;
  
    const pdf = new jsPDF('p', 'mm', 'a4');
  
    html2canvas(container).then(canvas => {
      console.log('Canvas generated');
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 190; // Fit to A4 page width
      const pageHeight = 297; // A4 page height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
      let heightLeft = imgHeight;
      let position = 0;
  
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
  
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
  
      console.log('PDF ready to save');
      pdf.save(`Report_${this.startYear}-${this.startMonth}_to_${this.endYear}-${this.endMonth}.pdf`);
      console.log('PDF download triggered');
    }).catch(err => {
      console.error('Error generating PDF:', err);
    });
  }
  
}
