
const ANIMATION_PROPERTY = "grid-template-columns"
const ANIMATION_STEP_DELTA = 40;

export class SidebarComponent {

  #node: HTMLElement
  #gridTemplateData: Array<number>

  constructor(node: HTMLElement | string) {
    this.#node = node instanceof HTMLElement ? node : <HTMLElement>document.querySelector(node)

    this.#gridTemplateData = this.getGridTemplateColumnsData()

    new MutationObserver(this.onDataLevelAttributeChange).observe(this.#node, {
      attributes: true, 
      attributeFilter: ["data-level"],
      childList: false, 
      characterData: false,
    })
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
