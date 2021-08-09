import Hammer from 'hammerjs'
import { MarksComponent } from "../marks"

export class MapComponent {

  #imageContainer: HTMLElement = <HTMLElement>document.querySelector('.layout__map');
  #panContainer: HTMLElement = <HTMLElement>document.querySelector('.layout__pan');
  //#imageUrl: string = "";
  #displayImage: HTMLImageElement = <HTMLImageElement>document.querySelector('.map__image.map__image--active');
  #minScale:number = 0.5;
  #maxScale:number = 4;
  //#imageWidth:number = 0;
  //#imageHeight:number = 0;
  #containerWidth:number = 0;
  #containerHeight:number = 0;
  #displayImageX:number = 0;
  #displayImageY:number = 0;
  #displayImageScale:number = 1;
  
  #displayDefaultWidth:number = 0;
  #displayDefaultHeight:number = 0;
  
  #rangeX:number = 0;
  #rangeMaxX:number = 0;
  #rangeMinX:number = 0;
  
  #rangeY:number = 0;
  #rangeMaxY:number = 0;
  #rangeMinY:number = 0;
  
  //#displayImageRangeY:number = 0;
  
  #displayImageCurrentX:number = 0;
  #displayImageCurrentY:number = 0;
  #displayImageCurrentScale:number = 1;
  
  constructor() {
    this.resizeContainer();

    window.addEventListener('resize', this.resizeContainer, true);

    //this.#displayImage = new Image();
    //this.#displayImage.src = this.#imageUrl;
    this.#displayImage.onload = this.onImageLoad;
    //window.addEventListener("load", () => this.onImageLoad)
    //this.onImageLoad();
    const hammertime = new Hammer(this.#imageContainer);
  
    hammertime.get('pinch').set({ enable: true });
    hammertime.get('pan').set({ direction: Hammer.DIRECTION_ALL });
    
    hammertime.on('pan', ev => {  
      this.#displayImageCurrentX = this.clamp(this.#displayImageX + ev.deltaX, this.#rangeMinX, this.#rangeMaxX);
      this.#displayImageCurrentY = this.clamp(this.#displayImageY + ev.deltaY, this.#rangeMinY, this.#rangeMaxY);
      this.updateDisplayImage(this.#displayImageCurrentX, this.#displayImageCurrentY, this.#displayImageScale);
    });
    
    hammertime.on('pinch pinchmove', ev => {
      this.#displayImageCurrentScale = this.clampScale(ev.scale * this.#displayImageScale);
      this.updateRange();
      this.#displayImageCurrentX = this.clamp(this.#displayImageX + ev.deltaX, this.#rangeMinX, this.#rangeMaxX);
      this.#displayImageCurrentY = this.clamp(this.#displayImageY + ev.deltaY, this.#rangeMinY, this.#rangeMaxY);
      this.updateDisplayImage(this.#displayImageCurrentX, this.#displayImageCurrentY, this.#displayImageCurrentScale);
    });
    
    hammertime.on('panend pancancel pinchend pinchcancel', () => {
      this.#displayImageScale = this.#displayImageCurrentScale;
      this.#displayImageX = this.#displayImageCurrentX;
      this.#displayImageY = this.#displayImageCurrentY;
    });

    const marks = new MarksComponent(this.panContainer)
    ;(<any>window)._marks = marks

    //Этот код выводит координаты по клику. Можно его закомментить
    marks.container.addEventListener('mouseup', ({offsetX, offsetY}) => {

        // let x = Math.round(event.clientX - this.#imageContainer.getBoundingClientRect().left - 
        //   this.#displayImageCurrentX + (this.#displayImage.getBoundingClientRect().width - 
        //     this.#imageContainer.getBoundingClientRect().width) / 2);
        // let y = Math.round(event.clientY - this.#imageContainer.getBoundingClientRect().top - 
        //   this.#displayImageCurrentY + (this.#displayImage.getBoundingClientRect().height - 
        //     this.#imageContainer.getBoundingClientRect().height) / 2 );
        window.alert(`${offsetX}, ${offsetY}`);
        // console.dir(maeventrks.container.getBoundingClientRect());
        // console.dir(event);
    },{ passive: true});

    
  }

  private onImageLoad(): void {
    //this.#imageWidth = this.#displayImage.width;
    //this.#imageHeight = this.#displayImage.height;
    this.#imageContainer.appendChild(this.#displayImage);
    this.#displayImage.addEventListener('mousedown', e => e.preventDefault(), false);
    this.#displayDefaultWidth = this.#displayImage.offsetWidth;
    this.#displayDefaultHeight = this.#displayImage.offsetHeight;
    this.#rangeX = Math.max(0, this.#displayDefaultWidth - this.#containerWidth);
    this.#rangeY = Math.max(0, this.#displayDefaultHeight - this.#containerHeight);
  }
  
  private resizeContainer(): void {
    this.#containerWidth = this.#imageContainer.offsetWidth;
    this.#containerHeight = this.#imageContainer.offsetHeight;
    if (this.#displayDefaultWidth !== undefined && this.#displayDefaultHeight !== undefined) {
      this.#displayDefaultWidth = this.#displayImage.offsetWidth;
      this.#displayDefaultHeight = this.#displayImage.offsetHeight;
      this.updateRange();
      this.#displayImageCurrentX = this.clamp( this.#displayImageX, this.#rangeMinX, this.#rangeMaxX );
      this.#displayImageCurrentY = this.clamp( this.#displayImageY, this.#rangeMinY, this.#rangeMaxY );
      this.updateDisplayImage(
        this.#displayImageCurrentX,
        this.#displayImageCurrentY,
        this.#displayImageCurrentScale );
    }
  }
  
  get panContainer() {
    return this.#panContainer
  }
  
  private clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(min, value), max);
  }
  
  private clampScale(newScale: number): number {
    return this.clamp(newScale, this.#minScale, this.#maxScale);
  }
  
  private updateDisplayImage(x: number, y: number, scale: number):void {
    const transform = 'translateX(' + x + 'px) translateY(' + y + 'px) translateZ(0px) scale(' + scale + ',' + scale + ')';
    this.#panContainer.style.transform = transform;
    this.#panContainer.style.webkitTransform = transform;
  }

  private updateRange(): void {
    this.#rangeX = Math.max(0, Math.round(this.#displayDefaultWidth * this.#displayImageCurrentScale) - this.#containerWidth);
    this.#rangeY = Math.max(0, Math.round(this.#displayDefaultHeight * this.#displayImageCurrentScale) - this.#containerHeight);
    
    this.#rangeMaxX = Math.round(this.#rangeX / 2);
    this.#rangeMinX = 0 - this.#rangeMaxX;
  
    this.#rangeMaxY = Math.round(this.#rangeY / 2);
    this.#rangeMinY = 0 - this.#rangeMaxY;
  }

  center(x: number,y: number) {
    this.#displayImageX = (x - this.#displayImage.clientWidth / 2) * -1;
    this.#displayImageY = (y - this.#displayImage.clientHeight / 2) * -1;
    console.log(this.#displayImageX, this.#displayImageY)
    this.updateDisplayImage(this.#displayImageX, this.#displayImageY,this.#displayImageCurrentScale)
  }
  
}