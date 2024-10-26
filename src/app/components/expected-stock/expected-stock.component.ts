import { Component, OnInit } from '@angular/core';
import { StockService } from '../../services/stock-services/stock.service';
import { IStock } from '../../models/stock';
import { Guid } from 'guid-typescript';
import { CountContainersResponse } from '../../models/countContainersResponse';

@Component({
  selector: 'app-expected-stock',
  templateUrl: './expected-stock.component.html',
  styleUrl: './expected-stock.component.css'
})

export class ExpectedStockComponent implements OnInit {

  readonly title: string;
  readonly subTitle: string;
  
  constructor (private stockServ: StockService) {
    this.title = 'Сток ожидаемых'
    this.subTitle = 'Мониторинг ожидаемых контейнеров'
  }
  
  stocks: IStock[] = []; 
  countContainers = new CountContainersResponse();
  
  ngOnInit(): void {
      this.loadStocks();
  }

  // Loading of Stocks
  loadStocks(): void {
    this.stockServ.getStocks().subscribe(res => { this.stocks = res.data;
      // for (let stock of this.stocks) {
        
      //   this.stockServ.getCountContainers(stock.id).subscribe(res => {
      //     this.countContainers = res.data;
      //     stock.emptyCntrsCount = this.countContainers.emptyCount;
      //     stock.loadedCntrsCount = this.countContainers.loadedCount;
      //   })

      // }
    });
  }

  public stockId: Guid | undefined;
  openStock(id: Guid): void {
    this.stockId = id;
  }

  isShowUnactive: boolean = false;

  showUnactive(): void {
    if (this.isShowUnactive) this.isShowUnactive = false; 
    else this.isShowUnactive = true;
  }

  isTileView: boolean = true;

  showAsTile(): void {
    if (!this.isTileView) this.isTileView = true;
  }

  showAsTable(): void {
    if (this.isTileView) this.isTileView = false;
  }

}
