
export class TimelineComponent {
  #node: HTMLElement
  #cursor: HTMLElement
  #cursorTransitionClass: string
  #mapsContainer: HTMLElement
  //#mapTransitionClass: string = "map__image--transition"
  #mapActiveClass: string = "map__image--active"

  #items: Array<number> = []

  #dX: number = 0
  #isMove: boolean = false

  constructor({
    root, cursor, cursorTransitionClass, itemsSelector, mapsContainer
  }: {
    root: HTMLElement | string
    cursor: HTMLElement | string
    cursorTransitionClass: string
    itemsSelector: string
    mapsContainer: HTMLElement | string
  }) {
    this.#node = root instanceof HTMLElement ? root : <HTMLElement>(document.querySelector(root))
    this.#cursor = cursor instanceof HTMLElement ? cursor : <HTMLElement>(this.#node.querySelector(cursor))
    this.#cursorTransitionClass = cursorTransitionClass

    this.#mapsContainer = mapsContainer instanceof HTMLElement ? mapsContainer : <HTMLElement>(document.querySelector(mapsContainer))
    this.#mapsContainer.children[0].classList.add(this.#mapActiveClass)

    this.#items = Array.from(this.#node.querySelectorAll<HTMLElement>(itemsSelector)).map((node, i) => {
      node.addEventListener("click", () => this.click(i))
      return Math.round(node.offsetLeft + node.offsetWidth / 2)
    })
    this.#cursor.style.setProperty("--left", `${this.#items[0]}px`)

    console.log(this.#items)


    this.#cursor.addEventListener("pointerdown", this.pointerDown)
    window.addEventListener("pointermove", this.pointerMove, { passive: true })
    window.addEventListener("pointerup", this.pointerUp, { passive: true })
  }

  private pointerDown = ({offsetX}: PointerEvent) => {
    this.#dX = Math.round(offsetX - this.#cursor.offsetWidth / 2) + this.#node.offsetLeft
    this.#cursor.classList.remove(this.#cursorTransitionClass)
    this.#isMove = true 
  }

  private pointerMove = ({clientX}: PointerEvent) => {
    if (!this.#isMove) return
    this.#cursor.style.setProperty("--left", `${clientX - this.#dX}px`)
  }

  private pointerUp = () => {
    
    const x: number = Number.parseInt(getComputedStyle(this.#cursor).getPropertyValue("--left"))
    const y: number = Number.parseInt(getComputedStyle(this.#cursor).getPropertyValue("--top"))
    if(y > (this.#node.offsetTop - 50)) {
      this.#isMove = false
      let nX: number = Infinity
      let j: number = 0
      
      for (let i = 0; i < this.#items.length; i++) {
        if (x < this.#items[i] && this.#items[i] - x < nX) {
          nX = this.#items[i] - x
          j = i
        } else if (x - this.#items[i] < nX) {
          nX = x - this.#items[i]
          j = i
        }
      }
      this.#cursor.classList.add(this.#cursorTransitionClass)
      this.#cursor.style.setProperty("--left", `${this.#items[j]}px`)
    }


    // selMap.addEventListener('transitionend', () => {
    //   selMap.classList.remove(this.#mapTransitionClass)
    //   selMap.classList.add(this.#mapActiveClass)
    //   if(oldMap) { oldMap.classList.remove(this.#mapActiveClass) }
    // }, false)
    

    //this.$emit("input", j)
  }

  private click(i: number) {
    this.#cursor.classList.add(this.#cursorTransitionClass)
    this.#cursor.style.setProperty("--left", `${this.#items[i]}px`)

    let sel = <HTMLElement>this.#node.children[i]
    let selYear = sel.dataset.year
    let oldMap = <HTMLElement>this.#mapsContainer.querySelector('.'+this.#mapActiveClass)
    let selMap = <HTMLElement>this.#mapsContainer.querySelector(`[data-year~="${selYear}"]`)
    selMap.classList.add(this.#mapActiveClass)
    if(oldMap) { oldMap.classList.remove(this.#mapActiveClass) }
  }
}
