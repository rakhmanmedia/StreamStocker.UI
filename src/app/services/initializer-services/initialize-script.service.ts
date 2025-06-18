import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InitializeScriptService {

  private renderer: Renderer2;
  private loadedScripts = new Set<string>();

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
   }

  loadScript(src: string): Promise<void> {

    if (this.loadedScripts.has(src)) {
      console.log(`${src} уже загружен.`)
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const script = this.renderer.createElement('script');
      script.src = src;
      script.type = 'text/javascript';
      script.defer = true;

      script.onload = () => {
        console.log(`${src} загружен.`)
        this.loadedScripts.add(src);
        resolve();
      };

      script.onerror = (error: any) => {
        console.log(`Ошибка загрузки ${src}: ${error}`);
        reject(error);
      };

      this.renderer.appendChild(document.body, script);
    })
  }

  loadScripts(scripts: string[]): Promise<void[]> {
    return Promise.all(scripts.map((script) => this.loadScript(script)));
  }
}
