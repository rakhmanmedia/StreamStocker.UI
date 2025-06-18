import { Component, OnInit } from '@angular/core';
import { StockService } from '../../../services/stock-services/stock.service';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { Stock } from '../../../models/stock';
import { ToastrService } from 'ngx-toastr';
import { EmptyContainerCount } from '../../../models/empty-container-count';

@Component({
  selector: 'app-empty-stock',
  templateUrl: './empty-stock.component.html',
  styleUrl: './empty-stock.component.css'
})
export class EmptyStockComponent implements OnInit {

  stocks: Stock[];
  isLoading: boolean = false;
  isError: boolean = false;

  constructor (
    private stockServ: StockService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();  
  }

  private loadData(): void {
    this.isLoading = true;
    this.isError = false;

    this.stockServ.getStocks()
      .pipe(switchMap(stocksResponse => {
        const stocks = stocksResponse.data
        if (!stocks?.length) return of([]);

        return forkJoin(
          stocks.map(stock =>
            this.stockServ.getEmptyContainerCount(stock.id)
              .pipe(map(countContainer => {
                const emptyContainerCount = new EmptyContainerCount();
                emptyContainerCount.inRepairCount = countContainer?.data?.inRepairCount ?? 0;
                emptyContainerCount.inStockCount = countContainer?.data?.inStockCount ?? 0;
                emptyContainerCount.issuedCount = countContainer?.data?.issuedCount ?? 0;
                return {
                  ...stock,
                  emptyContainersCount: emptyContainerCount
                }
              }))
          )
        )
      }))
      .subscribe({
        next: (result) => {
          console.log(this.stocks);

          this.stocks = result;
          this.isLoading = false;
        },
        error: (err) => {
          this.isLoading = false;
          this.isError = true;
          this.toastr.error(err.error);
        }
      })
  }
}