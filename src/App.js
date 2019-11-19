import React, { useState, useEffect } from 'react'
import './App.css'
import Ions from './Ions.js'
import { ThemeProvider } from 'emotion-theming'
import theme from '@rebass/preset'
import {
  Box,
  Text,
  Flex,
  Heading,
  Link
} from 'rebass'
import {
  Label,
  Input
} from '@rebass/forms'

const calcAlk = bicar => bicar * 50 / 61
const calcRa = (alk, ca, mg) => alk - ((ca / 1.4) + (mg / 1.7))

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
  const [size, setSize] = useState(17)
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

  const [distilledPh, setDistilledPh] = useState(0)
  const [mashPh, setMashPh] = useState(0)
  const [ratio, setRatio] = useState(3)
  const [slope, setSlope] = useState(0)
  const [roasted, setRoasted] = useState(0)
  const [color, setColor] = useState(0)
  const [dilutionRatio, setDilutionRatio] = useState(0)
  const [dilutedIons, setDiluted] = useState(ions)
  const [salts, setSalts] = useState({
    caso: 0,
    cacl: 0,
    mgso: 0
  })
  const [ionsAfterSalts, setIonsAfterSalts] = useState(ions)
  const [lactic, setLactic] = useState(0)
  const [acidMalt, setAcidMalt] = useState(0)
  const [phosphoric, setPhosphoric] = useState(0)
  const [sparge, setSparge] = useState(0)
  const [spargeSalts, setSpargeSalts] = useState({
    caso: 0,
    cacl: 0,
    mgso: 0
  })
  const [spargeIons, setSpargeIons] = useState({})

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
    const alkLac = (-0.88 * 1.209 / 90.08) * 1000 * 50 * lactic / size
    const alkMalt = (-0.03 / 90.08) * 1000 * 50 * acidMalt / size
    const alkPho = (-0.1 * 1.05 / 98) * 1000 * 50 * phosphoric / size
    const ra = (calcRa(calcAlk(ionsAfterSalts.hco), ionsAfterSalts.ca, ionsAfterSalts.mg)) + alkLac + alkMalt + alkPho
    setRa(ra)
  }, [lactic, acidMalt, phosphoric, ionsAfterSalts.hco, ionsAfterSalts.ca, ionsAfterSalts.mg, size])

  useEffect(() => {
    setSlope(0.037 + 0.014 * ratio)
  }, [ratio])

  useEffect(() => {
    const noRoastpH = 5.6 - ((color / 1.97) * (0.18) / 12)
    const roastpH = 5.6 - (((color / 1.97) / 12) * (0.18 * (1 - roasted) + 0.05 * roasted))
    const ph = (roasted) => roasted === 0 ? noRoastpH : roastpH
    setDistilledPh(ph(roasted))
  }, [color, roasted])

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

  useEffect(() => {
    setSpargeIons(sparge === 0 ? { ...ions } : {
      ca: ions.ca + (0.2328 * spargeSalts.caso * 1000 + 0.2726 * spargeSalts.cacl * 1000) / sparge,
      mg: ions.mg + (0.0986 * spargeSalts.mgso * 1000) / sparge,
      na: ions.na,
      cl: ions.cl + (0.4823 * spargeSalts.cacl * 1000) / sparge,
      so: ions.so + (0.5577 * spargeSalts.caso * 1000 + 0.3896 * spargeSalts.mgso * 1000) / sparge,
      hco: ions.hco
    })
  }, [spargeSalts, ions, sparge])

  const onIonChange = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : ions[e.target.name]
    setIons({ ...ions, [e.target.name]: value })
    setDiluted(scaleIons({ ...ions,
      [e.target.name]: value
    }, dilutionRatio / 100))
    setSpargeIons({ ...ions, [e.target.name]: value })
  }

  const onRatioChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : ratio
    setRatio(value)
  }

  const onSizeChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : size
    const validatedValue = value === 0 ? 0.1 : value
    setSize(validatedValue)
  }

  const onRoastedChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : roasted
    setRoasted(value / 100)
  }

  const onColorChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : color
    setColor(value)
  }

  const onDilutionRatioChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : dilutionRatio
    setDilutionRatio(value)
    const ratio = value / 100
    setDiluted(scaleIons(ions, ratio))
  }

  const onSaltChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : salts[e.target.name]
    setSalts({
      ...salts,
      [e.target.name]: value
    })
  }

  const onLacticChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : lactic
    setLactic(value)
  }

  const onAcidMaltChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : acidMalt
    setAcidMalt(value)
  }

  const onPhosphoricChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : phosphoric
    setPhosphoric(value)
  }

  const onSpargeChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : sparge
    const validatedValue = value === 0 ? 0.1 : value
    setSparge(validatedValue)
  }

  const onSpargeSaltChanged = e => {
    const value = e.target.value.length > 0 ? parseFloat(e.target.value) : spargeSalts[e.target.name]
    setSpargeSalts({
      ...spargeSalts,
      [e.target.name]: value
    })
  }

  return (
    <ThemeProvider theme={theme}>

      <Box
        width='100%'
        height='48px'
        sx={{
          position: 'fixed',
          bg: '#fff'
        }}
      >
        <Flex justifyContent='space-between' width={1} flexWrap='wrap'>
          <Flex pt={3} pl={3} fontWeight='500' width={[1 / 4, 1 / 2, 1 / 4]}>
            <Text as='span' color='#735DD0'>/eau.<span style={{ color: '#FF00AA' }}>joliebulle</span></Text>

          </Flex>
          <Flex pt={3} fontWeight='bold' width={[3 / 4, 1 / 2, 1 / 2]} justifyContent='flex-end'>
            <Text px={3} >Residual Alkalinity (as CaCO3) : {Math.round(ra * 10) / 10} </Text>
            <Text px={3} >Mash pH : {Math.round(mashPh * 100) / 100}</Text>
          </Flex>
        </Flex>

      </Box>
      <Box px={5} py={5}>
        <Heading pt={3}>Beer color</Heading>
        <Box as='form'
          pt={3}
          onSubmit={e => e.preventDefault()}>
          <Flex flexDirection='column'>
            <Flex alignItems='center' width={[1, 1 / 2, 1 / 4]} >
              <Label width={1} pr={4}>Roasted color&nbsp;(%)</Label>
              <Input
                width={1 / 4}
                id='roasted'
                name='roasted'
                type='number'
                min='0'
                step='0.1'
                defaultValue='0'
                onChange={onRoastedChanged}
              />
            </Flex>

            <Flex alignItems='center' width={[1, 1 / 2, 1 / 4]} mt={3} >
              <Label width={1} pr={4}>Beer color&nbsp;(EBC)</Label>
              <Input
                width={1 / 4}
                id='color'
                name='color'
                type='number'
                min='0'
                step='0.1'
                defaultValue='0'
                onChange={onColorChanged}
              />
            </Flex>
          </Flex>
        </Box>
        <Box mt={4} fontWeight='bold'>
          <Flex>
            <Text pr={2}>Distilled Water Mash pH:</Text>
            <Text>{Math.round(distilledPh * 1000) / 1000}</Text>
          </Flex>
        </Box>
        <Heading pt={5}>Mash</Heading>
        <Box as='form'
          pt={3}
          onSubmit={e => e.preventDefault()}>
          <Flex flexDirection='column'>
            <Flex alignItems='center' width={[1, 1 / 2, 1 / 4]}>
              <Label width={1}>Mash water&nbsp;(L)</Label>
              <Input
                width={1 / 4}
                id='size'
                name='size'
                type='number'
                min='0'
                step='0.1'
                value={size}
                onChange={onSizeChanged}
              />
            </Flex>
            <Flex alignItems='center' width={[1, 1 / 2, 1 / 4]} mt={3}>
              <Label width={1}>Mash thickness&nbsp;(L/Kg)</Label>
              <Input
                width={1 / 4}
                id='ratio'
                name='ratio'
                type='number'
                min='0'
                step='0.1'
                defaultValue='3'
                onChange={onRatioChanged}
              />
            </Flex>
          </Flex>
        </Box>
        <Heading pt={5}>Water report</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()}
          py={3} >
          <Flex flexWrap='wrap'>
            <Box width={[1, 1 / 4, 1 / 4]} mr={3} mt={3}>
              <Label>Calcium&nbsp;(ppm)</Label>
              <Input
                width={100}
                id='ca'
                name='ca'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box width={[1, 1 / 4, 1 / 4]} mr={3} mt={3}>
              <Label>Magnesium&nbsp;(ppm)</Label>
              <Input
                width={100}
                id='mg'
                name='mg'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box width={[1, 1 / 4, 1 / 4]} mr={3} mt={3}>
              <Label>Sodium&nbsp;(ppm)</Label>
              <Input
                width={100}
                id='na'
                name='na'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box width={[1, 1 / 4, 1 / 4]} mr={3} mt={3}>
              <Label>Chloride&nbsp;(ppm)</Label>
              <Input
                width={100}
                id='cl'
                name='cl'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box width={[1, 1 / 4, 1 / 4]} mr={3} mt={3}>
              <Label>Sulfate&nbsp;(ppm)</Label>
              <Input
                width={100}
                id='so'
                name='so'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onIonChange}
              />
            </Box>
            <Box width={[1, 1 / 4, 1 / 8]} mt={3}>
              <Label>Bicarbonates&nbsp;(ppm)</Label>
              <Input
                width={100}
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
              <Text pr={2}>Alkalinity&nbsp;(as CaCo3): </Text>
              <Text>{Math.round(alk * 10) / 10} ppm</Text>
            </Flex>
          </Box>
        </Box>

        <Heading fontSize={5} mt={5} mb={4}>Alkalinity control</Heading>
        <Heading>Dilution with reverse-osmosis water</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()} mt={4}>
          <Label>Dilute the source water at&nbsp;(%)</Label>
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
        <Ions ions={dilutedIons} title={'New Water Profile'} />
        <Heading mt={5}>Salt additions</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()}
          py={3} mt={3}>
          <Flex flexWrap='wrap'>
            <Box mr={2} mt={2} width={[1, 1 / 4, 1 / 8]}>
              <Label>CaSO4&nbsp;(g)</Label>
              <Input
                width={100}
                id='caso'
                name='caso'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onSaltChanged}
              />
            </Box>
            <Box mr={2} mt={2} width={[1, 1 / 4, 1 / 8]}>
              <Label>CaCl2&nbsp;(g)</Label>
              <Input
                width={100}
                id='cacl'
                name='cacl'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onSaltChanged}
              />
            </Box>
            <Box mr={2} mt={2} width={[1, 1 / 4, 1 / 8]}>
              <Label>MgSO4&nbsp;(g)</Label>
              <Input
                width={100}
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
        <Ions ions={ionsAfterSalts} title={'New Water Profile'} />
        <Heading mt={5}>Acid additions</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()}
          py={3} >
          <Flex flexDirection='column'>
            <Box pr={2}>
              <Label>Lactic acid 88% (ml)</Label>
              <Input
                width={100}
                id='lactic'
                name='lactic'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onLacticChanged}
              />
            </Box>
            <Box pr={2} mt={4}>
              <Label>Acid malt (g)</Label>
              <Input
                width={100}
                id='acidMalt'
                name='acidMalt'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onAcidMaltChanged}
              />
              <Text>Do not forget to adjust color and mash thickness when adding acid malt</Text>
            </Box>
            <Box pr={2} mt={4}>
              <Label>Phosphoric acid 10% (ml)</Label>
              <Input
                width={100}
                id='phosphoric'
                name='phosphoric'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onPhosphoricChanged}
              />
            </Box>
          </Flex>
        </Box>
        <Heading fontSize={5} mt={5} mb={4}>Sparge Water</Heading>
        <Flex alignItems='center' width={[1, 1 / 2, 1 / 4]}>
          <Label width={1}>Sparge water&nbsp;(L)</Label>
          <Input
            width={1 / 4}
            id='sparge'
            name='sparge'
            type='number'
            min='0'
            step='0.1'
            value={sparge}
            onChange={onSpargeChanged}
          />
        </Flex>
        <Heading mt={5}>Salt additions</Heading>
        <Box as='form'
          onSubmit={e => e.preventDefault()}
          py={3} mt={3}>
          <Flex flexWrap='wrap'>
            <Box mr={2} mt={2} width={[1, 1 / 4, 1 / 8]}>
              <Label>CaSO4&nbsp;(g)</Label>
              <Input
                width={100}
                id='caso'
                name='caso'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onSpargeSaltChanged}
              />
            </Box>
            <Box mr={2} mt={2} width={[1, 1 / 4, 1 / 8]}>
              <Label>CaCl2&nbsp;(g)</Label>
              <Input
                width={100}
                id='cacl'
                name='cacl'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onSpargeSaltChanged}
              />
            </Box>
            <Box mr={2} mt={2} width={[1, 1 / 4, 1 / 8]}>
              <Label>MgSO4&nbsp;(g)</Label>
              <Input
                width={100}
                id='mgso'
                name='mgso'
                type='number'
                min='0'
                defaultValue='0'
                onChange={onSpargeSaltChanged}
              />
            </Box>
          </Flex>
        </Box>
        <Ions ions={spargeIons} title={'Sparge Water Profile'} />

        <Flex fontWeight='bold' mt={6} justifyContent='space-between' flexWrap='wrap'>
          <Link href='https://github.com/314r/eau.joliebulle' color='#735DD0'>Source Code (MIT Licensed)</Link>
          <Text>Use at your own risks !</Text>
        </Flex>
      </Box>
    </ThemeProvider>
  )
}

export default App
