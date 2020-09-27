
const ANIMATION_PROPERTY = "grid-template-columns"
const ANIMATION_STEP_DELTA = 40;
import Siema from 'siema';

export class SidebarComponent {

  #node: HTMLElement
  #nodeFirstLevel: HTMLElement | null
  #nodeSecondLevel: HTMLElement | null
  #nodeThirdLevel: HTMLElement | null
  #gridTemplateData: Array<number>
  contentFile: string = "/content/output.json"
  data: Array<object> = []

  constructor(node: HTMLElement | string) {
    this.#node = node instanceof HTMLElement ? node : <HTMLElement>document.querySelector(node)

    this.#gridTemplateData = this.getGridTemplateColumnsData()

    new MutationObserver(this.onDataLevelAttributeChange).observe(this.#node, {
      attributes: true, 
      attributeFilter: ["data-level"],
      childList: false, 
      characterData: false,
    })

    this.#nodeFirstLevel = this.#node.querySelector('.mm-sections')
    this.#nodeSecondLevel = this.#node.querySelector('.mm-items')
    this.#nodeThirdLevel = this.#node.querySelector('.mm-detail')

    this.getContent()
  }

  private async getContent() {
    let response = await fetch(this.contentFile);

		if (response.ok) {
		  let json = await response.json();
      this.data = json
      this.renderContent()
		} else {
		  console.log("Ошибка HTTP: " + response.status);
		}
  } 

  private renderContent() {
    let sectionsList = '<ul class="mm-items">'
    let detailList = ""
    this.data.forEach((section:any, index) => {
      sectionsList += `<li class="mm-sections__section"> \
        <a class="mm-sections__section-link" onclick="_sidebar.changeLevel(2, ${index})"> \
          <div class="mm-sections__icon"> \
            <img src='content/${section.name}/${section.icon.base}'> \
          </div> \
          <div class="mm-sections__title">${section.name}</div> \
        </a> \
      </li>`
      sectionsList += '</ul>'
      let itemsList = ""
      
      section.filesOutput.forEach((file:any, index2:number) => {
        let thumb = ""
        if(typeof file.imagesOutput[0] !== 'undefined') {
          thumb = `<div class="mm-image-thumb"><img src="${file.imagesOutput[0].directory}/${file.imagesOutput[0].base}" alt="${file.imagesOutput[0].name}"></div>`
        }
        itemsList += `<li class="mm-item"> \
          <a onclick="_sidebar.changeLevel(3, ${index}, ${index2})"> \
            ${thumb}
            <div class="mm-detail-short">${file.tpContent}</div>
            
          </a> \
        </li>`
        let imagesList = ""
        file.imagesOutput.forEach((image:any) => {
          imagesList += `<div class="mm-image"><img src="${image.directory}/${image.base}" alt="${image.name}"></div>`
        })

        
        detailList += `<div class="mm-item mm-detail-item" id="mm-detail-${index}-${index2}"><div class="mm-sidebar__header mm-detail__header">
            <div class="mm-images-list siema">${imagesList}</div>
          </div>
          <div class="mm-detail__text">
          ${file.tpContent}  
          </div></div>`
      })
      let div = document.createElement("div")
      div.innerHTML = itemsList
      div.setAttribute('class', 'mm-items-section')
      div.setAttribute('id', 'mm-items-section-' + index)

      this.#nodeSecondLevel?.appendChild(div)
    })

    if(this.#nodeFirstLevel && this.#nodeThirdLevel) {
      this.#nodeFirstLevel.innerHTML = sectionsList
      this.#nodeThirdLevel.innerHTML = detailList

      const mySiema = new Siema({
  selector: '.siema'
})
      console.log(mySiema)
    }
  }

  public changeLevel(level:string, section:number, item:number) {
    if(document.querySelector('.sidebar')) {
      let sidebar:HTMLElement = <HTMLElement>document.querySelector('.sidebar')
      sidebar.dataset.level = level

      if(section >= 0) {
        document.querySelectorAll('.mm-items-section').forEach((sect:any) => {
          sect.classList.remove("visible")
        })
        let selSection:HTMLElement = <HTMLElement>document.querySelector('#mm-items-section-' + section)
        selSection.classList.add("visible")
      }
      if(item >= 0) {
        document.querySelectorAll('.mm-detail-item').forEach((itm:any) => {
          itm.classList.remove("visible")
        })
        let selItem:HTMLElement = <HTMLElement>document.querySelector('#mm-detail-' + section + '-' + item)
        selItem.classList.add("visible")
      }
    }
    return false
  }

  private getGridTemplateColumnsData(): Array<number> {
    return getComputedStyle(this.#node).getPropertyValue(ANIMATION_PROPERTY).split(/\s+/g).map(v => Number.parseInt(v))
  }

  private onDataLevelAttributeChange = () => {
    this.#node.style.removeProperty(ANIMATION_PROPERTY)
    const newGrid = this.getGridTemplateColumnsData()
    this.animateValue(newGrid)
  }

  private animateValue = (newGrid: Array<number> = []) => {
    let isAnimated = false
    this.#gridTemplateData = newGrid.map((v, i) => {
      const old = this.#gridTemplateData[i] || 0
      if (v === old) return v

      isAnimated = true
      const d = v - old

      if (d > ANIMATION_STEP_DELTA) return old + ANIMATION_STEP_DELTA
      if (d < ANIMATION_STEP_DELTA * -1) return old - ANIMATION_STEP_DELTA
      return v
    })
    
    if (isAnimated) {
      requestAnimationFrame(() => {
        this.#node.style.setProperty(ANIMATION_PROPERTY, this.#gridTemplateData.map(v => `${v}px`).join(" "))
        this.animateValue(newGrid)
      })
      return
    }

    this.#node.style.removeProperty(ANIMATION_PROPERTY)
  }

  get level(): number {
    return Math.max(1, Math.min(3, Number.parseInt(this.#node.dataset.level || "0") || 0))
  }

  set level(v: number) {
    this.#node.dataset.level = Math.max(1, Math.min(3, v)).toString()
  }
}
