import { Position } from './types'

// eslint-disable-next-line max-statements
export function findRightIndexBack(point: any, line: Position[] = []) {
  let minIdx = -1
  let minDist = Infinity

  for (let index = 0; index < line.length; index++) {
    const point1 = line[index]
    const dist = distance(point, point1)

    if (dist < minDist) {
      minIdx = index
      minDist = dist
    }
  }

  if (minIdx === 0) {
    return 0
  }
  if (minIdx === line.length - 1) {
    return minIdx - 1
  }

  const leftDistBwtTarget = distance(point, line[minIdx - 1])
  const leftDistBwtMinIdx = distance(line[minIdx], line[minIdx - 1])

  if (leftDistBwtTarget < leftDistBwtMinIdx) {
    return minIdx - 1
  }

  return minIdx
}

export function distance(point0: Position, point1: Position) {
  return Math.sqrt(Math.pow(point1.x - point0.x, 2) + Math.pow(point1.y - point0.y, 2))
}

export function findRightIndex(point: Position, line: Position[] = []) {
  let minIdx = -1
  let minDist = Infinity

  for (let index = 0; index < line.length - 1; index++) {
    if (pointInBound(point, line[index], line[index + 1])) {
      const dist = distanceToLine(point, line[index], line[index + 1])

      if (dist < minDist) {
        minIdx = index
        minDist = dist
      }
    }
  }
  if (minIdx === -1) {
    return findRightIndexBack(point, line)
  }
  return minIdx
}

// eslint-disable-next-line complexity
export function pointInBound(p0: Position, p1: Position, p2: Position) {
  const { x: x1, y: y1 } = p1
  const { x: x2, y: y2 } = p2
  const { x: x0, y: y0 } = p0

  if (x1 < x0 && x0 < x2 && y1 < y0 && y0 < y2) {
    return true
  }
  if (x2 < x0 && x0 < x1 && y2 < y0 && y0 < y1) {
    return true
  }
  if (x1 < x0 && x0 < x2 && y1 > y0 && y0 > y2) {
    return true
  }
  if (x2 < x0 && x0 < x1 && y2 > y0 && y0 > y1) {
    return true
  }

  return false
}

export function distanceToLine(p0: Position, p1: Position, p2: Position) {
  const top = (p2.y - p1.y) * p0.x
    - (p2.x - p1.x) * p0.y
    + p2.x * p1.y
    - p2.y * p1.x
  const bot = Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2)

  return Math.abs(top) / Math.sqrt(bot)
}

export function alignEndsHorizontally(points: [number, number][], curvature: number) {
  const p1 = points[0]
  const p2 = points[1]
  const p3 = points[points.length - 2]
  const p4 = points[points.length - 1]
  const hx1 = p1[0] + Math.abs(p2[0] - p1[0]) * curvature
  const hx2 = p4[0] - Math.abs(p4[0] - p3[0]) * curvature

  points = [...points]
  points.splice(1, 0, [hx1, p1[1]])
  points.splice(points.length - 1, 0, [hx2, p4[1]])

  return points
}

type Root = Element | DocumentFragment

type TagMap = HTMLElementTagNameMap
type SVGMap = SVGElementTagNameMap

export function deepQuerySelector<K extends keyof TagMap>(root: Root, selectors: K): TagMap[K] | null
export function deepQuerySelector<K extends keyof SVGMap>(root: Root, selectors: K): SVGMap[K] | null
export function deepQuerySelector<E extends Element = Element>(root: Root, selectors: string): E | null
export function deepQuerySelector(root: Root, selector: string): Element | null {
  const element = root.querySelector(selector)

  if (element) return element

  const childNodes = Array.from(root.querySelectorAll('*'))

  for (const node of childNodes) {
    const shadowRoot = node.shadowRoot

    if (shadowRoot) {
      const found = deepQuerySelector(shadowRoot, selector)

      if (found) return found
    }
  }

  return null
}
