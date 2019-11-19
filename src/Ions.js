import React from 'react'
import {
  Box,
  Text,
  Flex
} from 'rebass'

function Ions (props) {
  return (
    <Box>
      <Text fontWeight='bold' sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} fontSize={1} mt={4} color='#FF00AA'>
        {props.title}
      </Text>
      <Flex flexWrap='wrap'>
        <Text sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} fontWeight='bold' fontSize={1} mt={2} mr={2} width={[1, 1 / 4, 1 / 4]}>
              Calcium:&nbsp;{Math.round(props.ions.ca * 10) / 10}&nbsp;ppm
        </Text>
        <Text sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} fontWeight='bold' fontSize={1} mt={2} mr={2} width={[1, 1 / 4, 1 / 4]}>
              Magnesium:&nbsp;{Math.round(props.ions.mg * 10) / 10}&nbsp;ppm
        </Text>
        <Text sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} fontWeight='bold' fontSize={1} mt={2} mr={2} width={[1, 1 / 4, 1 / 4]}>
              Sodium:&nbsp;{Math.round(props.ions.na * 10) / 10}&nbsp;ppm
        </Text>
        <Text sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} fontWeight='bold' fontSize={1} mt={2} mr={2} width={[1, 1 / 4, 1 / 4]}>
              Chloride:&nbsp;{Math.round(props.ions.cl * 10) / 10}&nbsp;ppm
        </Text>
        <Text sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} fontWeight='bold' fontSize={1} mt={2} mr={2} width={[1, 1 / 4, 1 / 4]}>
              Sulfate:&nbsp;{Math.round(props.ions.so * 10) / 10}&nbsp;ppm
        </Text>
        <Text sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} fontWeight='bold' fontSize={1} mt={2} width={[1, 1 / 4, 1 / 8]}>
              Bicarbonates:&nbsp;{Math.round(props.ions.hco * 10) / 10}&nbsp;ppm
        </Text>
      </Flex>
    </Box>
  )
}

export default Ions
