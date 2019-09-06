import React, { useState, useEffect } from 'react'
import './App.css'
import { ThemeProvider } from 'emotion-theming'
import theme from '@rebass/preset'
import {
  Box,
  Text,
  Flex,
  Heading
} from 'rebass'
import {
  Label,
  Input
} from '@rebass/forms'
const nanoid = require('nanoid')

const calcAlk = bicar => bicar * 50 / 61
const calcRa = (alk, ca, mg) => alk - ((ca / 1.4) + (mg / 1.7))
const fraction = (grains, g) => {
  const total = grains.reduce((acc, item) => acc + item.weight, 0)
  return g.weight / total
}
const acidity = grain => grain.grainType === 'b'
  ? -1.9 + (grain.color / 1.97)
  : grain.grainType === 'c'
    ? 5 + 0.453 * (grain.color / 1.97)
    : grain.grainType === 'w'
      ? -9.6
      : grain.grainType === 'r'
        ? 42
        : 0

const scaleIons = (ions, ratio) => {
  return {
    ca: ions.ca - ions.ca * ratio,
    mg: ions.mg - ions.mg * ratio,
    na: ions.na - ions.na * ratio,
    cl: ions.cl - ions.cl * ratio,
    so: ions.so - ions.so * ratio,
    hco: ions.hco - ions.hco * ratio
  }
}

function App () {
  const [size, setSize] = useState(0)
  const [alk, setAlk] = useState(0)
  const [ra, setRa] = useState(0)
  const [ions, setIons] = useState({
    ca: 0,
    mg: 0,
    na: 0,
    cl: 0,
    so: 0,
    hco: 0
  })
  const [grains, setGrains] = useState([
    { name: '2-row', grainType: 'b', color: 3.94, id: nanoid(), weight: 4536 },
    { name: 'wheat', grainType: 'w', color: 3.94, id: nanoid(), weight: 454 },
    { name: 'crystal 35', grainType: 'c', color: 68.95, id: nanoid(), weight: 227 },
    { name: 'black patent', grainType: 'r', color: 1000, id: nanoid(), weight: 91 }
  ])

  const [distilledPh, setDistilledPh] = useState(0)
  const [mashPh, setMashPh] = useState(0)
  const [ratio, setRatio] = useState(3)
  const [slope, setSlope] = useState(0)
  const [dilutionRatio, setDilutionRatio] = useState(0)
  const [dilutedIons, setDiluted] = useState(ions)
  const [salts, setSalts] = useState({
    caso: 0,
    cacl: 0,
    mgso: 0
  })
  const [ionsAfterSalts, setIonsAfterSalts] = useState({})
  const [lactic, setLactic] = useState(0)

  useEffect(() => {
    setAlk(calcAlk(ions.hco))
    setRa(calcRa(calcAlk(ions.hco), ions.ca, ions.mg))
  }, [ions.hco, ions.ca, ions.mg])

  useEffect(() => {
    setAlk(calcAlk(dilutedIons.hco))
    setRa(calcRa(calcAlk(dilutedIons.hco), dilutedIons.ca, dilutedIons.mg))
  }, [dilutedIons.hco, dilutedIons.ca, dilutedIons.mg])

  useEffect(() => {
    setAlk(calcAlk(ionsAfterSalts.hco))
    setRa(calcRa(calcAlk(ionsAfterSalts.hco), ionsAfterSalts.ca, ionsAfterSalts.mg))
  }, [ionsAfterSalts.hco, ionsAfterSalts.ca, ionsAfterSalts.mg])

  useEffect(() => {
    const alk = (-0.88 * 1.209 / 90.08) * 1000 * 50 * lactic / size
    const ra = (calcRa(calcAlk(ionsAfterSalts.hco), ionsAfterSalts.ca, ionsAfterSalts.mg)) + alk
    setRa(ra)
  }, [lactic])

  useEffect(() => {
    const fGrains = grains.map(grain => {
      grain.fraction = fraction(grains, grain)
      return grain
    })
    const aGrains = fGrains.map(grain => {
      grain.acidity = acidity(grain)
      return grain
    })
    const faGrains = aGrains.map(grain => {
      grain.fa = grain.fraction * grain.acidity
      return grain
    })
    const sumFa = faGrains.reduce((acc, item) => acc + item.fa, 0)
    setDistilledPh(5.72 - 0.0337 * sumFa)
  }, [grains])

  useEffect(() => {
    setSlope(0.037 + 0.014 * ratio)
    setSize((grains.reduce((acc, item) => acc + item.weight, 0) / 1000) * ratio)
  }, [ratio])

  useEffect(() => {
    setMashPh(distilledPh + slope * ra / 50)
  }, [distilledPh, slope, ra])

  useEffect(() => {
    const newWater = {
      ca: dilutedIons.ca + (0.2328 * salts.caso * 1000 + 0.2726 * salts.cacl * 1000) / size,
      mg: dilutedIons.mg + (0.0986 * salts.mgso * 1000) / size,
      na: dilutedIons.na,
      cl: dilutedIons.cl + (0.4823 * salts.cacl * 1000) / size,
      so: dilutedIons.so + (0.5577 * salts.caso * 1000 + 0.3896 * salts.mgso * 1000) / size,
      hco: dilutedIons.hco
    }
    setIonsAfterSalts(newWater)
  }, [salts, dilutedIons, size])

  const onIonChange = e => {
    setIons({ ...ions,
      [e.target.name]: parseFloat(e.target.value)
    })
    setDiluted(scaleIons({ ...ions,
      [e.target.name]: parseFloat(e.target.value)
    }, dilutionRatio / 100))
  }

  const onRatioChanged = e => {
    setRatio(parseFloat(e.target.value))
  }

  const onDilutionRatioChanged = e => {
    setDilutionRatio(parseFloat(e.target.value))
    const ratio = parseFloat(e.target.value) / 100
    setDiluted(scaleIons(ions, ratio))
  }

  const onSaltChanged = e => {
    setSalts({
      ...salts,
      [e.target.name]: parseFloat(e.target.value)
    })
  }

  const onLacticChanged = e => {
    setLactic(parseFloat(e.target.value))
  }

  return (
    <ThemeProvider theme={theme}>
      <Box p={4}>
        <Heading>Water report</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()}
          py={3} >
          <Flex>
            <Box px={2}>
              <Label>Calcium</Label>
              <Input
                id='ca'
                name='ca'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box px={2}>
              <Label>Magnesium</Label>
              <Input
                id='mg'
                name='mg'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box px={2}>
              <Label>Sodium</Label>
              <Input
                id='na'
                name='na'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box px={2}>
              <Label>Chloride</Label>
              <Input
                id='cl'
                name='cl'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box px={2}>
              <Label>Sulfate</Label>
              <Input
                id='so'
                name='so'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box px={2}>
              <Label>Bicarbonates</Label>
              <Input
                id='hco'
                name='hco'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
          </Flex>
          <Box ml={2} mt={4} fontWeight='bold'>
            <Flex >
              <Text pr={2}>Alkalinity (as CaCo3): </Text>
              <Text>{Math.round(alk * 10) / 10}</Text>
            </Flex>
            <Flex>
              <Text pr={2}>Residual alkinity: </Text>
              <Text>{ra}</Text>
            </Flex>
          </Box>
        </Box>
        <Heading mt={5} mb={4}>Grains</Heading>
        {grains.map(grain =>
          <Box>{grain.name}</Box>
        )}
        <Box mt={4} fontWeight='bold'>
          <Flex>
            <Text pr={2}>Distilled Water Mash Ph:</Text>
            <Text>{Math.round(distilledPh * 1000) / 1000}</Text>
          </Flex>
        </Box>
        <Box as='form'
          onSubmit={e => e.preventDefault()} mt={3}>
          <Label>Mash thickness (L/Kg)</Label>
          <Input
            width={100}
            id='ratio'
            name='ratio'
            type='number'
            min='0'
            step='0.1'
            defaultValue='3'
            onChange={onRatioChanged}
          />
        </Box>
        <Box>Volume : {size}</Box>
        <Box mt={4} fontWeight='bold'>
          <Flex>
            <Text pr={2}> Mash Ph:</Text>
            <Text>{Math.round(mashPh * 100) / 100}</Text>
          </Flex>
        </Box>
        <Heading mt={5}>Alkalinity control</Heading>
        <Heading>Dilution with reverse-osmosis water</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()} mt={3}>
          <Label>Dilute the source water at (%)</Label>
          <Input
            width={100}
            id='ro'
            name='ro'
            type='number'
            min='0'
            max='100'
            step='1'
            defaultValue='0'
            onChange={onDilutionRatioChanged}
          />
        </Box>
        <Box>
          <Text fontWeight='bold' mt={3}>New water profile</Text>
          <Flex>
            <Box>
              Calcium : {dilutedIons.ca}
            </Box>
            <Box pl={3}>
              Magnesium : {dilutedIons.mg}
            </Box>
            <Box pl={3}>
              Sodium : {dilutedIons.na}
            </Box>
            <Box pl={3}>
              Chloride : {dilutedIons.cl}
            </Box>
            <Box pl={3}>
              Sulfate : {dilutedIons.so}
            </Box>
            <Box pl={3}>
              Bicarbonates : {dilutedIons.hco}
            </Box>
          </Flex>
        </Box>
        <Heading mt={5}>Salt additions</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()}
          py={3} >
          <Flex>
            <Box px={2}>
              <Label>CaSO4</Label>
              <Input
                id='caso'
                name='caso'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onSaltChanged}
              />
            </Box>
            <Box px={2}>
              <Label>CaCl2</Label>
              <Input
                id='cacl'
                name='cacl'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onSaltChanged}
              />
            </Box>
            <Box px={2}>
              <Label>MgSO4</Label>
              <Input
                id='mgso'
                name='mgso'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onSaltChanged}
              />
            </Box>
          </Flex>
        </Box>
        <Box>
          <Text fontWeight='bold' mt={3}>New water profile</Text>
          <Flex>
            <Box>
              Calcium : {ionsAfterSalts.ca}
            </Box>
            <Box pl={3}>
              Magnesium : {ionsAfterSalts.mg}
            </Box>
            <Box pl={3}>
              Sodium : {ionsAfterSalts.na}
            </Box>
            <Box pl={3}>
              Chloride : {ionsAfterSalts.cl}
            </Box>
            <Box pl={3}>
              Sulfate : {ionsAfterSalts.so}
            </Box>
            <Box pl={3}>
              Bicarbonates : {ionsAfterSalts.hco}
            </Box>
          </Flex>
        </Box>
        <Heading mt={5}>Acid additions</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()}
          py={3} >
          <Flex>
            <Box px={2}>
              <Label>Lactic acid</Label>
              <Input
                id='lactic'
                name='lactic'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onLacticChanged}
              />
            </Box>
          </Flex>
        </Box>
      </Box>
    </ThemeProvider>
  )
}

export default App
