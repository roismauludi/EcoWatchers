import React, { useContext, useRef } from "react";
import { Transition, Backdrop } from "@windmill/react-ui";
import SidebarContext from "context/SidebarContext";
import SidebarContent from "./SidebarContent";

function MobileSidebar() {
  const sidebarRef = useRef(null);
  const { isSidebarOpen, closeSidebar, saveScroll } =
    useContext(SidebarContext);

  const linkClickedHandler = () => {
    saveScroll(sidebarRef.current);
  };

  return (
    <Transition show={isSidebarOpen}>
      <>
        <Transition
          enter="transition ease-in-out duration-150"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition ease-in-out duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={closeSidebar}
          ></div>
        </Transition>
        <Transition
          enter="transition ease-in-out duration-150"
          enterFrom="-translate-x-full"
          enterTo="translate-x-0"
          leave="transition ease-in-out duration-150"
          leaveFrom="translate-x-0"
          leaveTo="-translate-x-full"
        >
          <aside
            id="mobileSidebar"
            ref={sidebarRef}
            className="fixed inset-y-0 left-0 z-50 flex-shrink-0 w-64 mt-16 overflow-y-auto bg-white dark:bg-gray-800 lg:hidden transition-transform duration-200 transform"
          >
            <SidebarContent linkClicked={linkClickedHandler} />
          </aside>
        </Transition>
      </>
    </Transition>
  );
}

export default MobileSidebar;
