let nextUnitOfWork = null
let rootFiber = null

export function createRoot(element, container) {
  rootFiber = {
    stateNode: container, // 记录对应的真实 dom 节点
    element: {
      // 挂载 element
      props: {
        children: [element]
      }
    },
  }
  nextUnitOfWork = rootFiber
}