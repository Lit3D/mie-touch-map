export class MarksComponent {

  #node: HTMLElement
  #container: HTMLElement = document.createElement("div")
  contentFile: string = "/content/output.json"
  data: Array<object> = []

  constructor(node: HTMLElement | string) {
    this.#node = node instanceof HTMLElement ? node : <HTMLElement>document.querySelector(node)
    console.log(this.#node)
    this.getContent()
  }

  get container() {
    return this.#container
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
    this.#container.classList.add('map__marks-container')
    this.data.forEach((section:any, index:number) => {  
      section.filesOutput.forEach((file:any, index2:number) => {
        if(file.coord) {
          let [x, y] = file.coord.split(", ")
          let mark = document.createElement("a")
          mark.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 59 59"><path d="M44.5 15c0-8.271-6.729-15-15-15s-15 6.729-15 15c0 7.934 6.195 14.431 14 14.949V58a1 1 0 102 0V29.949c7.805-.518 14-7.015 14-14.949zm-20 0c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/></svg>'
          mark.addEventListener("click", ()=>{
            ;(<any>window)._sidebar.changeLevel(3, index, index2)
          })
          mark.style.top = y + "px"
          mark.style.left = x + "px"
          mark.classList.add('map__mark')
          mark.id = `mm-mark-${index}-${index2}`
          this.#container.appendChild(mark)
        }
      })
    })

    this.#node.appendChild(this.#container)

  }

  active(section:number, item:number) {
    this.#node.querySelectorAll('.map__mark').forEach((itm:any) => {
      itm.classList.remove("active")
    })
    const selItem = <HTMLElement>this.#node.querySelector(`#mm-mark-${section}-${item}`)
    if(!selItem) return
    selItem.classList.add("active")

    ;(<any>window)._map.center(parseInt(selItem.style.left),parseInt(selItem.style.top))
  }

  dropActive() {
    this.#node.querySelectorAll('.map__mark').forEach((itm:any) => {
      itm.classList.remove("active")
    })
  }
}
