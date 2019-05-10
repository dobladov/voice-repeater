
const  parseCSV = (csv) => {
  let data = [];

  let newLinebrk = csv.split("\n");
  const titles = newLinebrk[0].split(',')
  for(let i = 1; i < newLinebrk.length; i++) {
      const line = newLinebrk[i].split(",")
      const obj = {}
      titles.forEach((title, i) => {
          obj[title] = line[i]
      });
      data.push(obj)
  }
  return(data)
}

onmessage = (e) => {
  let csv = null
  for (file of e.data) {
      if (file.type === "text/csv") {
          csv = file
      }
  }

  const path = csv && csv.webkitRelativePath && csv.webkitRelativePath.replace(csv.name, "")

  if (csv && path) {
      const reader = new FileReader()

      reader.addEventListener('load', (e) => {
          let csvdata = e.target.result
          const data = parseCSV(csvdata)
          postMessage({
            data: data.slice(0, 20),
            path
          })
      })

      reader.readAsText(csv)
  }
}