function render(element, container) {
  const dom = renderDom(element)
  container.appendChild(dom)
}

// 将 React.Element 渲染为真实 dom
function renderDom(element) {
  let dom = null // 要返回的 dom
  
  // 条件渲染为假，返回 null
  if (!element && element !== 0) {
    return null
  }

  // 如果 element 本身为 string，返回文本节点
  if (typeof element === 'string') {
    dom = document.createTextNode(element)
    return dom
  }

  // 如果 element 本身为 number，将其转为 string 后返回文本节点
  if (typeof element === 'number') {
    dom = document.createTextNode(String(element))
    return dom
  }

  // 列表渲染
  if (Array.isArray(element)) {
    dom = document.createDocumentFragment()
    for(let item of element) {
      let child = renderDom(item)
      console.log('%%%%%%%', item, child)
      if (child) {
        dom.appendChild(child)
      }
    }
    return dom
  }

  const {
    type,
    props: { 
      children 
    },
  } = element

  if (typeof type === 'string') {
    // 常规 dom 节点的渲染
    dom = document.createElement(type)
  } else if (typeof type === 'function') {
    // React组件的渲染（区分类组件还是函数组件）
    if (type.prototype.isReactComponent) {
      // 类组件
      const { props, type: Comp } = element
      const component = new Comp(props)
      const jsx = component.render()
      dom = renderDom(jsx)
    } else {
      // 函数组件
      const { props, type: Fn } = element
      const jsx = Fn(props)
      dom = renderDom(jsx)
    }
  } else {
    // 其他情况暂不考虑
    return null
  }

  if (children) {
    // children 存在，对子节点递归渲染
    const childrenDom = renderDom(children)
    if (childrenDom) {
      dom.appendChild(childrenDom)
    }
  }
  return dom
}

const ReactDOM = {
  render,
}

export default ReactDOM;
