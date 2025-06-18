import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StockService } from '../../services/stock-services/stock.service';
import { Stock } from '../../models/stock';
import { CountContainers } from '../../models/countContainers';
import { ToastrService } from 'ngx-toastr';
import { forkJoin, map, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-expected-stock',
  templateUrl: './expected-stock.component.html',
  styleUrl: './expected-stock.component.css'
})

export class ExpectedStockComponent implements OnInit {
 
  constructor (
    private stockServ: StockService,
    private toastr: ToastrService
  ) { }
  
  stocks: Stock[] = []; // список стоков
  filtredStocks: Stock[] = []; // список стоков
  stocksCount: number = 0;
  isLoading: boolean = false;
  isError: boolean = false;
  //countContainers = new CountContainers();
  
  ngOnInit(): void {
    this.isLoading = true;
    this.isError = false;
    this.onLoad();
  }

  // Loading of Stocks
  onLoad(): void {
    this.stockServ.getStocks()
    .pipe(switchMap(stocksResponse => {
      const stocks = stocksResponse.data
      if (!stocks?.length) return of([]);

      return forkJoin(
        stocks.map(stock => 
          this.stockServ.getCountContainers(stock.id)
          .pipe(map(countContainer => ({
            ...stock, 
            emptyCntrsCount: countContainer?.data?.emptyCount ?? 0, 
            loadedCntrsCount: countContainer?.data?.loadedCount ?? 0
          })))
        )
      )
    }))
    .subscribe({
      next: (result) => {
        this.stocks = result;
        this.showUnactive();
        this.isLoading = false;
      },
      error: (err) => {
        this.isError = true;
        this.toastr.error(err.error);
      }
    })
  }

  isShowUnactive: boolean = true;
  showUnactive(): void {
    this.isShowUnactive = !this.isShowUnactive;

    if (!this.stocks) return;

    this.filtredStocks = this.isShowUnactive
      ? [...this.stocks]
      : this.stocks.filter(stock => stock.emptyCntrsCount > 0 || stock.loadedCntrsCount > 0);

    this.stocksCount = this.filtredStocks.length;

  }

  isTileView: boolean = true;

  showAsTile(): void {
    if (!this.isTileView) this.isTileView = true;
  }

  showAsTable(): void {
    if (this.isTileView) this.isTileView = false;
  }

}
