'use client'

import { Box, Typography, Slider, Paper } from '@mui/material'
import { styled } from '@mui/material/styles'
import { TIME_OPTIONS } from '@/app/lib/constants'

const StyledSlider = styled(Slider)(({ theme }) => ({
  color: theme.palette.primary.main,
  height: 8,
  '& .MuiSlider-track': {
    border: 'none',
  },
  '& .MuiSlider-thumb': {
    height: 24,
    width: 24,
    backgroundColor: '#fff',
    border: '2px solid currentColor',
    '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
      boxShadow: 'inherit',
    },
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiSlider-valueLabel': {
    lineHeight: 1.2,
    fontSize: 12,
    background: 'unset',
    padding: 0,
    width: 32,
    height: 32,
    borderRadius: '50% 50% 50% 0',
    backgroundColor: theme.palette.primary.main,
    transformOrigin: 'bottom left',
    transform: 'translate(50%, -100%) rotate(-45deg) scale(0)',
    '&:before': { display: 'none' },
    '&.MuiSlider-valueLabelOpen': {
      transform: 'translate(50%, -100%) rotate(-45deg) scale(1)',
    },
    '& > *': {
      transform: 'rotate(45deg)',
    },
  },
}))

interface TimeRangeSelectorProps {
  startIndex: number
  endIndex: number
  onChange: (event: Event, newValue: number | number[]) => void
}

export function TimeRangeSelector({
  startIndex,
  endIndex,
  onChange,
}: TimeRangeSelectorProps) {
  const marks = TIME_OPTIONS.map((time, index) => ({
    value: index,
    label: time,
  }))

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        选择时间范围
      </Typography>
      <Box sx={{ px: 2 }}>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {TIME_OPTIONS[startIndex]} - {TIME_OPTIONS[endIndex]}
        </Typography>
        <StyledSlider
          value={[startIndex, endIndex]}
          onChange={onChange}
          valueLabelDisplay="auto"
          valueLabelFormat={(value) => TIME_OPTIONS[value]}
          min={0}
          max={TIME_OPTIONS.length - 1}
          marks={marks.filter((_, i) => i % 5 === 0)}
          sx={{ mt: 2 }}
        />
      </Box>
    </Paper>
  )
}
