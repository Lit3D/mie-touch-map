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
    this.data.forEach((section:any) => {  
      section.filesOutput.forEach((file:any) => {
        if(file.coord) {
          let [x, y] = file.coord.split(", ")
          let mark = document.createElement("div")
          mark.style.top = y + "px"
          mark.style.left = x + "px"
          mark.classList.add('map__mark')
          this.#container.appendChild(mark)
        }
      })
    })

    this.#node.appendChild(this.#container)

  }

}
