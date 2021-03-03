
// import { TimelineComponent } from "./components"
import { MapComponent } from "./components"
import { SidebarComponent } from "./components"

void async function main(){

  const sidebar = new SidebarComponent(".sidebar")
  ;(<any>window)._sidebar = sidebar
  const sidebarCloseBtnNode = <HTMLButtonElement>document.querySelector(".sidebar__close_btn")
  sidebarCloseBtnNode.addEventListener("click", () => sidebar.level = sidebar.level - 1)

  // const timeline = new TimelineComponent({
  //   root: ".timeline__list",
  //   cursor: ".timeline__cursor",
  //   itemsSelector: ".timeline__item",
  //   cursorTransitionClass: "timeline__cursor--transition",
  //   mapsContainer: ".layout__map"
  // })

  const map = new MapComponent()

  //console.log(timeline)
  console.log(map)
}()


