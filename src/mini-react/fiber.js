import { renderDom } from './react-dom'
import { reconcileChildren } from './reconciler'
import { commitRoot } from './commit'

let nextUnitOfWork = null
let workInProgressRoot = null // 当前工作的 fiber 树
let currentRoot = null // 上一次渲染的 fiber 树
let deletions = [] // 要执行删除 dom 的 fiber
let currentFunctionFiber = null // 当前正在执行的函数组件对应 fiber
let hookIndex = 0 //  当前正在执行的函数组件 hook 的下标

// 获取当前的执行的函数组件对应的 fiber
export function getCurrentFunctionFiber() {
  return currentFunctionFiber
}

// 获取当前 hook 下标
export function getHookIndex() {
  return hookIndex++
}

// 将某个 fiber 加入 deletions 数组
export function deleteFiber(fiber) {
  deletions.push(fiber)
}

// 获取 deletions 数组
export function getDeletions() {
  return deletions
}

export function commitRender() {
  workInProgressRoot = {
    stateNode: currentRoot.stateNode, // 记录对应的真实 dom 节点
    element: currentRoot.element,
    alternate: currentRoot,
  };
  nextUnitOfWork = workInProgressRoot
}

export function createRoot(element, container) {
  workInProgressRoot = {
    stateNode: container, // 记录对应的真实 dom 节点
    element: {
      // 挂载 element
      props: {
        children: [element]
      }
    },
    alternate: currentRoot
  }
  console.log('~~~~~~', workInProgressRoot)
  nextUnitOfWork = workInProgressRoot
}

// 执行当前工作单元并设置下一个要执行的工作单元
function performUnitOfWork(workInProgress) {
  // 1.根据fiber创建 dom
  if (!workInProgress.stateNode) {
    // 若当前 fiber 没有 stateNode，则根据 fiber 挂载的 element 的属性创建
    workInProgress.stateNode = renderDom(workInProgress.element)
  }
  // if (workInProgress.return && workInProgress.stateNode) {
  //   // 如果 fiber 有父 fiber且有 dom
  //   // 向上寻找能挂载 dom 的节点进行 dom 挂载
  //   let parentFiber = workInProgress.return
  //   while (!parentFiber.stateNode) {
  //     parentFiber = parentFiber.return
  //   }
  //   // parentFiber.stateNode.appendChild(workInProgress.stateNode)
  // }

  // 2.构建 fiber 树
  let children = workInProgress.element?.props?.children
  let type = workInProgress.element?.type

  if (typeof type === 'function') {
    // 当前 fiber 对应 React 组件时，对其 return 迭代
    if (type.prototype.isReactComponent) {
      // 类组件，通过生成的类实例的 render 方法返回 jsx
      // const { props, type: Comp } = workInProgress.element
      // const component = new Comp(props)
      // const jsx = component.render()
      // children = [jsx]
      updateClassComponent(workInProgress)
    } else {
      // 函数组件，直接调用函数返回 jsx
      // const { props, type: Fn } = workInProgress.element
      // const jsx = Fn(props)
      // children = [jsx]
      updateFunctionComponent(workInProgress)
    }
  }

  if (children || children === 0) {
    // children 存在时，对 children 迭代
    let elements = Array.isArray(children) ? children : [children]
    // 打平列表渲染时二维数组的情况（暂不考虑三维及以上数组的情形）
    elements = elements.flat()

    reconcileChildren(workInProgress, elements)
  }

  // 3.设置下一个工作单元
  if (workInProgress.child) {
    // 如果有子 fiber，则下一个工作单元是子 fiber
    nextUnitOfWork = workInProgress.child
  } else {
    let nextFiber = workInProgress
    while (nextFiber) {
      if (nextFiber.sibling) {
        // 没有子 fiber 有兄弟 fiber，则下一个工作单元是兄弟 fiber
        nextUnitOfWork = nextFiber.sibling
        return
      } else {
        // 子 fiber 和兄弟 fiber 都没有，深度优先遍历返回上一层
        nextFiber = nextFiber.return
      }
    }
    if (!nextFiber) {
      // 若返回最顶层，表示迭代结束，将 nextUnitOfWork 置空
      nextUnitOfWork = null
    }
  }
}

// 类组件的更新
function updateClassComponent(fiber) {
  let jsx
  if (fiber.alternate) {
    // 有旧组件，复用
    const component = fiber.alternate.component
    fiber.component = component
    component._UpdateProps(fiber.element.props)
    jsx = component.render()
  } else {
    // 没有则创建新组件
    const { props, type: Comp } = fiber.element
    const component = new Comp(props)
    fiber.component = component
    jsx = component.render()
  }
  reconcileChildren(fiber, [jsx])
}

// 函数组件的更新
function updateFunctionComponent(fiber) {
  currentFunctionFiber = fiber
  currentFunctionFiber.hooks = []
  hookIndex = 0
  const { props, type: Fn } = fiber.element
  const jsx = Fn(props)
  reconcileChildren(fiber, [jsx])
}

// 处理循环和中断逻辑
function workLoop(deadline) {
  let shouldYield = false
  while (nextUnitOfWork && !shouldYield) {
    // 循环执行工作单元任务
    performUnitOfWork(nextUnitOfWork)
    shouldYield = deadline.timeRemaining() < 1
  }
  if (!nextUnitOfWork && workInProgressRoot) {
    // 表示进入 commit 阶段
    commitRoot(workInProgressRoot)
    currentRoot = workInProgressRoot
    workInProgressRoot = null
    deletions = []
  }
  requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)