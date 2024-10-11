import { Component, OnInit } from '@angular/core';
import { StockService } from '../../services/stock-services/stock.service';
import { IStock } from '../../models/stock';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-expected-stock',
  templateUrl: './expected-stock.component.html',
  styleUrl: './expected-stock.component.css'
})
export class ExpectedStockComponent implements OnInit {

  readonly title: string; readonly subTitle: string;
  
  constructor (private stockServ: StockService) {
    this.title = 'Сток ожидаемых'
    this.subTitle = 'Мониторинг ожидаемых контейнеров'
  }
  
  stocks: IStock[] = []; 

  ngOnInit(): void {
      this.stockServ.getStocks().subscribe(res => { this.stocks = res.data;
    });
  }

  openStock(id: Guid): void {
    console.log(id);
    
  }

}
