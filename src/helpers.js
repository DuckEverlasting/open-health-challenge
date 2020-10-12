export function colorSpan(text, color) {
  return `<span style="color:${color}">${text}</span>`
}

export function getMinMax(array, attribute=null) {
  let min = Infinity,
    max = -Infinity
  array.forEach(el => {
    const num = !!attribute ? el[attribute] : el;
    if (num < min) {
      min = num
    }
    if (num > max) {
      max = num
    }
  })
  return [min, max]
}
