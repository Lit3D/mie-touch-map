
const ANIMATION_PROPERTY = "grid-template-columns"
const ANIMATION_STEP_DELTA = 40;

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
            <img src='data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiA/PjwhRE9DVFlQRSBzdmcgIFBVQkxJQyAnLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4nICAnaHR0cDovL3d3dy53My5vcmcvR3JhcGhpY3MvU1ZHLzEuMS9EVEQvc3ZnMTEuZHRkJz48c3ZnIGhlaWdodD0iNTEycHgiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDUxMiA1MTI7IiB2ZXJzaW9uPSIxLjEiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiB3aWR0aD0iNTEycHgiIHhtbDpzcGFjZT0icHJlc2VydmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxnIGlkPSJfeDM5XzJfeDJDX19tb3VzdGFjaGVfeDJDX19IaXBzdGVyX3gyQ19fbW92ZW1iZXJfeDJDX19tYWxlX3gyQ19fbWVuIj48Zz48cGF0aCBkPSJNMjk2LjI1NywxOTEuODIyYzIuMzIyLTAuMDIsNC43MDUsMC4yNjEsNy4xMjgsMC44ODEgICAgYzEzLjE5MywzLjMwNCwzNS45MzgsMjMuMzY0LDYwLjU0Myw0NS4wNjZjMzMuNDc0LDI5LjU1MSw3MC4zNzIsNjIuMTA1LDkzLjkxOCw2MS4zODVjMTMuODM0LTAuNDIxLDIyLjk2My0xMS40NzMsMjQuMTQ0LTM5LjU0MSAgICBjNi41ODcsMTguNDM4LDQuNjg1LDMyLjAzMy0yLjk4Myw0MS41MjJjLTkuMTA4LDExLjI3MS0yNi40MDcsMTcuMTE4LTQ3LjQ0OCwxOC42NGMtMjEuNDQzLDEuNTQxLTQ2LjY0OC0xLjQwMS03MS4xMzQtNy42NjggICAgYy0xOS41Mi00Ljk4NS0zOC41NC0xMi4wNTMtNTQuNzc3LTIwLjU4MmMtMC4xNC0wLjExOS0wLjI4LTAuMjItMC40NjEtMC4zMmMtMTQuMzc1LTcuNjQ3LTI2LjU0OC0xNi40NzctMzQuODc2LTI2LjAyNiAgICBjLTcuNDQ3LTguNTA5LTExLjc5Mi0xNy41NzgtMTEuODUyLTI2Ljg4OHYtMC4wOHYtMC45NDF2LTAuMTZjMC4wNi0zLjYwNCwwLjU4MS03LjI2OCwxLjQ4MS0xMC44NTIgICAgYzIuMzAyLTkuMTg5LDcuMTQ2LTE3LjgxOCwxMy42MTMtMjQuMTQ1QzI3OS44OCwxOTUuODg3LDI4Ny43NjgsMTkxLjg4MywyOTYuMjU3LDE5MS44MjIgTTI1My41NTIsMjM3LjE0OWwtMC4wMiwxLjE2MWwwLjAyLDAuMTggICAgYy0wLjEyLDguNjctMy44NjQsMTcuMDk4LTEwLjMzMSwyNS4wMjdjLTAuNCwwLjUtMC44MjEsMS0xLjI0LDEuNDhjLTguMzA5LDkuNTMtMjAuNTIyLDE4LjM3OS0zNS4wMzcsMjYuMTQ3ICAgIGMtMC4yMTksMC4xMDEtMC40MTksMC4yMi0wLjYsMC4zOGMtMTYuMjM3LDguNTI5LTM1LjI1NiwxNS41OTctNTQuNzU3LDIwLjYwMmMtMjQuNTA1LDYuMjQ3LTQ5LjcxMiw5LjE4OS03MS4xMzQsNy42NDggICAgYy0yMS4wNjMtMS41MjEtMzguMzU5LTcuMzY4LTQ3LjQ0OS0xOC42MTljLTcuNjg5LTkuNTEtOS41Ny0yMy4xMDQtMy4wMDQtNDEuNTQzYzEuMTgxLDI4LjA4OCwxMC4zMTEsMzkuMTIsMjQuMTQ2LDM5LjU0MSAgICBjMjMuNTY0LDAuNzIxLDYwLjQ0Mi0zMS44MzQsOTMuOTE3LTYxLjM2NGMyNC42MDUtMjEuNzIzLDQ3LjM0OS00MS43ODMsNjAuNTQyLTQ1LjA4N2MyLjQyMy0wLjYwMSw0LjgyNi0wLjg4MSw3LjEyOC0wLjg4MSAgICBjOC40ODksMC4wOCwxNi4zNzcsNC4wNjQsMjIuNzI0LDEwLjI5MWM2LjQ0Nyw2LjMyNiwxMS4yOTIsMTQuOTU1LDEzLjYxMywyNC4xNDUgICAgQzI1Mi45NzMsMjI5Ljg2MSwyNTMuNDczLDIzMy41MjUsMjUzLjU1MiwyMzcuMTQ5eiBNMjY2LjYwNSwyNjguNDAyYy00LjcyNC01LjQyNi04LjMyOC0xMS4wOTItMTAuNTMtMTYuOTU4ICAgIGMtMi4xNjIsNS43ODYtNS43MDcsMTEuNDEyLTEwLjQxMSwxNi43OThjLTguMDY4LDkuMjI5LTE5LjU2LDE3LjgzOC0zMy4xOTUsMjUuNDY2YzUuNjg2LDQuMDY0LDEyLjAxMyw3LjM2OCwxOC43NzksOS43MSAgICBjNy43MDksMi42NjMsMTYuMDM3LDQuMTA0LDI0Ljc0Niw0LjEwNHMxNy4wNTgtMS40NDEsMjQuNzQ2LTQuMTA0YzYuNzg3LTIuMzYyLDEzLjExNS01LjY0NiwxOC44LTkuNzEgICAgQzI4Ni4xMDYsMjg2LjIsMjc0LjY3NCwyNzcuNjUxLDI2Ni42MDUsMjY4LjQwMnoiIHN0eWxlPSJmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDsiLz48L2c+PC9nPjxnIGlkPSJMYXllcl8xIi8+PC9zdmc+'> \
          </div> \
          <div class="mm-sections__title">${section.name}</div> \
        </a> \
      </li>`
      sectionsList += '</ul>'
      let itemsList = ""
      
      section.filesOutput.forEach((file:any, index2:number) => {
        itemsList += `<li class="mm-item"> \
          <a onclick="_sidebar.changeLevel(3, ${index}, ${index2})"> \
            <h3>${file.name}</h3> \
            ${file.tpContent.substring(0,100)}...
          </a> \
        </li>`
        let imagesList = ""
        file.imagesOutput.forEach((image:any) => {
          imagesList += `<div class="mm-image"><img src="${image.directory}/${image.base}" alt="${image.name}"></div>`
        })

        
        detailList += `<div class="mm-item mm-detail-item" id="mm-detail-${index}-${index2}"><div class="mm-sidebar__header mm-detail__header">
            <div class="mm-images-list">${imagesList}</div>
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
