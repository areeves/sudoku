$(onReady)

function onReady() {
  // hard-code spec for dev
  let spec = `
    0 6 5 7 0 4 9 3 1
    2 4 3 5 0 0 0 0 0
    0 9 1 3 8 6 0 0 0
    0 2 0 1 0 8 0 0 4
    1 0 0 9 0 0 7 0 2
    3 0 0 6 5 2 8 0 9
    0 8 0 0 0 0 4 0 0
    0 0 7 0 0 0 0 0 0
    0 1 0 0 6 0 5 8 3
  `
  // remove whitespace
  spec = spec.replace(/[^0-9]/g, '')
  $('#spec').val(spec)
    .on('change', render)

  render()

  $('#solve').on('click', solve)
    .attr('disabled', null)
}

function render() {
  // load and normalize spec
  let spec = $('#spec').val()
  spec = specFromString(spec)

  const boardEl = $('#board')
  const table = $('<table cellpadding="8" cellspacing="0">')
  while( spec.length > 0 ) {
    const tr = $('<tr>')
    spec.slice(0,9).forEach(v => {
      v = v ? v : '_'
      tr.append( $('<td>').text(v) )
    })
    spec = spec.slice(9)
    table.append(tr)
  }
  boardEl.html(table)

  // move me to CSS file
  $('#board td').css("border-top","1px solid black")
  $('#board td').css("border-left","1px solid black")
  $('#board tr:last-child td').css("border-bottom","3px solid black")
  $('#board td:last-child').css("border-right","3px solid black")
  $('#board td:first-child, #board td:nth-child(4), #board td:nth-child(7)').css('border-left','3px solid black')
  $('#board tr:first-child td, #board tr:nth-child(4) td, #board tr:nth-child(7) td').css('border-top','3px solid black')
}

function specFromString(spec) {
  spec = spec.replace(/[^0-9]/g, '')
  while (spec.length < 81) {
    spec = spec + '0'
  }
  // easier to work with true array of numbers
  return Array.from(spec).map(v => Number(v))
}

function solve() {
  const spec = specFromString($('#spec').val())
  const solution = solveImpl(spec, 0)
  console.log('Solution', solution ? solution.join(' ') : solution)
  if (solution) {
    $('#spec').val(solution.join(''))
    render()
  }
}

function solveImpl(spec, depth) {
  console.log('solveImpl', spec.join(''), depth)
  const nextBlank = spec.indexOf(0)
  // base case: no blanks, we have a solution
  if (nextBlank == -1) {
    return spec
  }

  // generate a set of possible boards filling in the next missing blank
  let candidates = [1,2,3,4,5,6,7,8,9].map( v => {
    const a = Array.from(spec)
    a[nextBlank] = v
    return a
  })

  // filter out invalid candidates
  candidates = candidates.filter(validate)

  // check each remaining board for a solution and return it if found
  for (let i in candidates) {
    let solution = solveImpl(candidates[i], depth+1)
    if (solution)
      return solution
  }

  // all candidates exhausted without solution, return failure
  return false
}

function validate(spec) {
  let rows = []
  // validate rows
  for (let i = 0; i < spec.length; i += 9) {
    let row = spec.slice(i, i+9)
    rows.push(row) // keep for column check later
    if (!validateSet(row))
      return false
  }

  // validate columns
  for (let i = 0; i < 9; i++) {
    const col = rows.map(v => v[i])
    if (!validateSet(col))
      return false
  }

  // validate blocks
  const blocks = [
    [0,1,2,9,10,11,18,19,20].map(v => spec[v]),
    [3,4,5,12,13,14,21,22,23].map(v => spec[v]),
    [6,7,8,15,16,17,24,25,26].map(v => spec[v]),
    [27,28,29,36,37,38,45,46,47].map(v => spec[v]),
    [30,31,32,39,40,41,48,49,50].map(v => spec[v]),
    [33,34,35,42,43,44,51,52,53].map(v => spec[v]),
    [54,55,56,63,64,65,72,73,74].map(v => spec[v]),
    [57,58,59,66,67,68,75,76,77].map(v => spec[v]),
    [60,61,62,69,70,71,78,79,80].map(v => spec[v])
  ]
  for (let i in blocks) {
    if (!validateSet(blocks[i]))
      return false
  }

  return true
}

function validateSet(values) {
  // remove blanks
  values = values.filter(v => v > 0)

  // check if all remaining are unique
  const dedup = [...new Set(values)]
  return values.length == dedup.length
}
