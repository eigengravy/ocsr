<script setup>
const institutionsCsv = await (
  await fetch('https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/institutions.csv')
).text()
const institutions = institutionsCsv.split('\n').slice(1)

const peopleCsv = await (
  await fetch('https://raw.githubusercontent.com/emeryberger/CSrankings/gh-pages/csrankings.csv')
).text()
const people = peopleCsv
  .split('\n')
  .slice(1)
  .map((line) => line.split(','))

const data = people.reduce((acc, [name, institution, website, gscholar]) => {
  if (!acc[institution]) {
    acc[institution] = []
  }
  acc[institution].push({name, website, gscholar})
  return acc
}, {})
</script>

<template>
  <p>Institutes Count: {{ institutions.length }}</p>
  <p>Faculty Count: {{ people.length }}</p>
  <li v-for="(people, institution) in data">
    <h3>{{ institution }} ({{ people.lengthw }})</h3>
    <li v-for="prof in people">
      {{ prof.name }} 
      |
      <a :href=prof.website>home</a> 
      |
      <a :href="'https://scholar.google.com/citations?user='+prof.gscholar">gs</a>  
    </li>
  </li>
</template>
