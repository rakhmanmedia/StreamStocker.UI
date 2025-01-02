import { AfterViewInit, Component, OnInit } from '@angular/core';
import { StockService } from '../../services/stock-services/stock.service';
import { Stock } from '../../models/stock';
import { CountContainers } from '../../models/countContainers';
import { InitializeScriptService } from '../../services/initializer-services/initialize-script.service';
import { StockDetailService } from '../../services/stock-services/stock-detail.service';

@Component({
  selector: 'app-expected-stock',
  templateUrl: './expected-stock.component.html',
  styleUrl: './expected-stock.component.css'
})

export class ExpectedStockComponent implements OnInit, AfterViewInit {

  readonly title: string;
  readonly subTitle: string;
  
  constructor (
    private stockServ: StockService,
    private initScriptServ: InitializeScriptService
  ) {
    this.title = 'Сток ожидаемых'
    this.subTitle = 'Мониторинг ожидаемых контейнеров';
  }
  ngAfterViewInit(): void {
    this.initScriptServ.loadScript('./assets/js/core.bundle.js')
    .then(() => 
      console.log('Скрипт core.bundle.js загружен и готов к использованию.'))
    .catch((error) => 
      console.log(`При загружке скрипта core.bundle.js произошла ошибка: ${error}`));
  }
  
  stocks: Stock[] = []; 
  countContainers = new CountContainers();
  
  ngOnInit(): void {
      this.onLoadStocks();
  }

  // Loading of Stocks
  onLoadStocks(): void {
    this.stockServ.getStocks().subscribe(res => { this.stocks = res.data;
      
      for (let stock of this.stocks) {
        this.stockServ.getCountContainers(stock.id).subscribe(res => {
          this.countContainers = res.data;
          stock.emptyCntrsCount = this.countContainers.emptyCount;
          stock.loadedCntrsCount = this.countContainers.loadedCount;
        })
      }
    });
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
