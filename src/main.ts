
import { SidebarComponent } from "./components"


void async function main(){

  const sidebar = new SidebarComponent(".sidebar")
  const sidebarCloseBtnNode = <HTMLButtonElement>document.querySelector(".sidebar__close_btn")
  sidebarCloseBtnNode.addEventListener("click", () => sidebar.level = sidebar.level - 1)

}()


