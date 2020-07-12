
export class GridTemplateAnimation {

  private _node: HTMLElement
  private _grid: Array<number>
  private _cssProperty: string

  constructor(
    node: HTMLElement | string,
    private step: number = 1,
    property: "columns" | "rows" = "columns",
    attributeFilter: Array<string> = ["class"],
  ) {
    const _node = node instanceof Element ? node : document.querySelector<HTMLElement>(node);
    if (!_node) throw new TypeError("Incorrect node type")
    this._node = _node

    new MutationObserver(this.onAttributesChange).observe(this._node,{
      attributes: true, 
      attributeFilter,
      childList: false, 
      characterData: false,
    })

    this._cssProperty = `grid-template-${property}`
    this._grid = this.gridTemplateColumns
  }

  private get gridTemplateColumns(): Array<number> {
    return getComputedStyle(this._node).getPropertyValue(this._cssProperty).split(/\s+/g).map(v => Number.parseInt(v))
  }

  private onAttributesChange = () => {
    this._node.style.removeProperty(this._cssProperty)
    const newGrid = this.gridTemplateColumns
    this.animateValue(newGrid)
  }

  private animateValue = (newGrid: Array<number> = []) => {
    let isAnimated = false
    this._grid = newGrid.map((v, i) => {
      const old = this._grid[i] || 0
      if (v === old) {
        return v
      }

      isAnimated = true
      const d = v - old
      const step = this.step

      if (d > step) return old + step
      if (d < step * -1) return old - step
      return v
    })
    
    if (isAnimated) {
      requestAnimationFrame(() => {
        this._node.style.setProperty(this._cssProperty, this._grid.map(v => `${v}px`).join(" "))
        this.animateValue(newGrid)
      })
    } else {
        this._node.style.removeProperty(this._cssProperty)
    }
  }
}
