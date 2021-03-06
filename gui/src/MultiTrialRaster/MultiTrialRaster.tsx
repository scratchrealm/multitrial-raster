import colorForUnitId from 'common/ColorHandling/colorForUnitId';
import TimeScrollView, { use1dTimeToPixelMatrix, useMultiplePanelDimensions, usePixelsPerSecond, useTimeseriesMargins } from 'common/TimeScrollView/TimeScrollView';
import { DefaultToolbarWidth } from 'common/TimeWidgetToolbarEntries';
import { useRecordingSelectionTimeInitialization, useTimeRange } from 'contexts/RecordingSelectionContext';
import { optional } from 'figurl/viewInterface/validateObject';
import math, { matrix, multiply } from 'mathjs';
import React, { FunctionComponent, useMemo, useState } from 'react';
import { validateObject } from '../figurl';
import MultiTrialRasterControls from './MultiTrialRasterControls';

export type TimeseriesLayoutOpts = {
    hideToolbar?: boolean
    hideTimeAxis?: boolean
    useYAxis?: boolean
}

export type MultitrialRasterData = {
    spike_time: number[]
    trial_idx: number[]
    neuron_idx: number[]
    factor_idx?: number[]
    timeseriesLayoutOpts?: TimeseriesLayoutOpts
}
export const isMultitrialRasterData = (x: any): x is MultitrialRasterData => {
    return validateObject(x, {
        spike_time: () => (true),
        trial_idx: () => (true),
        neuron_idx: () => (true),
        factor_idx: optional(() => (true))
    })
}

export type RPPlotData = {
    indexId: number
    spikeTimesSec: number[]
    factors: number[]
}

type MultiTrialRasterProps = {
    data: MultitrialRasterData
    width: number
    height: number
}

type SpikeTrainsByNeuronTrial = {
    [neuronId: number]: {
        [trialId: number]: {
            times: number[],
            factors: number[]
        }
    }
}

export type PanelProps = {
    indexColor: string,
    height: number
    pixelSpikes: number[]
    perSpikeColor?: string[]
}

type PixelPanel = {
    key: string,
    label: string,
    props: PanelProps,
    paint: (context: CanvasRenderingContext2D, props: PanelProps) => void
}

const assembleSpikeTrainTensor = (distinctNeuronIds: number[], distinctTrialIds: number[], neuronIdx: number[], trialIdx: number[], spikes: number[], factorIdx?: number[]): SpikeTrainsByNeuronTrial => {
    const spikeTrainsByNeuronTrial: SpikeTrainsByNeuronTrial = {}
    distinctNeuronIds.forEach(neuronId => {
        spikeTrainsByNeuronTrial[neuronId] = {}
        distinctTrialIds.forEach(trialId => {
            spikeTrainsByNeuronTrial[neuronId][trialId] = {
                times: [],
                factors: []
            }
        })
    })
    spikes.forEach((time, i) => {
        spikeTrainsByNeuronTrial[neuronIdx[i]][trialIdx[i]].times.push(time)
        spikeTrainsByNeuronTrial[neuronIdx[i]][trialIdx[i]].factors.push(factorIdx ? factorIdx[i] : 0)
    })
    return spikeTrainsByNeuronTrial
}

const useSpikeTensor = (spike_time: number[], trial_idx: number[], neuron_idx: number[], factor_idx?: number[]) => {
    const neuronIds = useMemo(() => (
        [...new Set(neuron_idx)].sort((a, b) => (a - b))
    ), [neuron_idx])
    const trialIds = useMemo(() => (
        [...new Set(trial_idx)].sort((a, b) => (a - b))
    ), [trial_idx])
    // The size of spike_time is too great for the standard Math.min/max functions--they crash
    // explicit looping in memo below because this is reportedly much faster than a reduce loop
    const { baseStartTime, baseEndTime } = useMemo(() => {
        let max = -Infinity
        let min = Infinity
        spike_time.forEach(time => {
            if (max < time) max = time
            if (min > time) min = time
        })
        return {baseStartTime: min, baseEndTime: max}
    }, [spike_time])
    const spikeTrainsByNeuronTrial = useMemo(() => assembleSpikeTrainTensor(neuronIds, trialIds, neuron_idx, trial_idx, spike_time, factor_idx),
        [neuronIds, neuron_idx, spike_time, trialIds, trial_idx, factor_idx])
    return {
        distinctNeuronIds: neuronIds,
        distinctTrialIds: trialIds,
        baseStartTime,
        baseEndTime,
        spikeTensor: spikeTrainsByNeuronTrial
    }
}

const useTensorSlice = (mode: SlicingMode, selectedId: number, spikeTensor: SpikeTrainsByNeuronTrial): RPPlotData[] => {
    const labeledSpikeTrains = useMemo(() => {
        if (mode === 'slicing_by_neuron') {
            const slice = spikeTensor[selectedId]
            const res = Object.keys(slice).map(id => {
                return {
                    indexId: Number(id),
                    spikeTimesSec: slice[Number(id)].times,
                    factors: slice[Number(id)].factors
                }
            })
            return res
        } else if (mode === 'slicing_by_trial') {
            const slice = Object.keys(spikeTensor).map(Number).map(
                neuronId => {
                    return {
                        indexId: neuronId,
                        spikeTimesSec: spikeTensor[neuronId][selectedId].times,
                        factors: spikeTensor[neuronId][selectedId].factors
                    }
                }
            )
            return slice
        } else {
            return [] as any as RPPlotData[]
        }
    }, [mode, selectedId, spikeTensor])
    return labeledSpikeTrains
}

// This should obviously be made more complex to handle multiple metadata
// series, provide some customization, a fuller color map, etc.
const colorForSpikeIndex = (key: number): string => {
    switch (key) {
        case 0:
            return 'rgb(66, 135, 245)'
        case 1:
            return 'red'
        case 2:
            return 'rgb(212, 159, 15)'
        default:
            return 'black'
    }
}

type ColorLookup = (index: number) => string
const usePixelPanels = (slice: RPPlotData[], visibleTimeStartSeconds: number, visibleTimeEndSeconds: number, timeToPixelMatrix: math.Matrix, panelHeight: number, colorForSpikeIndex?: ColorLookup): PixelPanel[] => {
    const pixelPanels = useMemo(() => {
        return slice.sort((k1, k2) => (k1.indexId - k2.indexId))
            .map(plot => {
                const filteredSpikes = plot.spikeTimesSec.filter(t => (visibleTimeStartSeconds !== undefined) && (visibleTimeStartSeconds <= t) && (visibleTimeEndSeconds !== undefined) && (t <= visibleTimeEndSeconds))
                const augmentedSpikesMatrix = matrix([ filteredSpikes, new Array(filteredSpikes.length).fill(1) ])
                const pixelSpikes = multiply(timeToPixelMatrix, augmentedSpikesMatrix).valueOf() as number[]
                return {
                    key: `${plot.indexId}`,
                    label: `${plot.indexId}`,
                    props: {
                        indexColor: colorForUnitId(plot.indexId),
                        height: panelHeight,
                        pixelSpikes: pixelSpikes,
                        // consider expanding this to account for a broader selection of metadata types?
                        perSpikeColor: colorForSpikeIndex && plot.factors.map((factor) => colorForSpikeIndex(factor))
                    },
                    paint: paintPanel
                }
            })
    }, [panelHeight, slice, timeToPixelMatrix, visibleTimeEndSeconds, visibleTimeStartSeconds, colorForSpikeIndex])
    return pixelPanels
}

const paintPanel = (context: CanvasRenderingContext2D, props: PanelProps) => {
    context.strokeStyle = props.indexColor
    context.lineWidth = 3.0
    context.beginPath()
    // todo: consider resorting by stroke style to avoid context changes
    props.pixelSpikes.forEach((s, i) => {
        context.strokeStyle = props.perSpikeColor ? props.perSpikeColor[i] : context.strokeStyle
        context.moveTo(s, -2)
        context.lineTo(s, props.height + 2)
    })
    context.stroke()
}

export type SlicingMode = 'slicing_by_neuron' | 'slicing_by_trial'

const panelSpacings = [4, 0] // per-neuron, per-trial

const MultiTrialRaster: FunctionComponent<MultiTrialRasterProps> = ({data, width, height}) => {
    const {spike_time, trial_idx, neuron_idx, factor_idx, timeseriesLayoutOpts} = data
    const heightExBottomControls = useMemo(() => height - 40, [height])
    const { distinctNeuronIds, distinctTrialIds, baseStartTime, baseEndTime, spikeTensor } = useSpikeTensor(spike_time, trial_idx, neuron_idx, factor_idx)
    const [mode, setMode] = useState<SlicingMode>('slicing_by_neuron')
    const [colorSource, setColorSource] = useState<number>(1)
    const [selectedNeuron, setSelectedNeuron] = useState<number>(distinctNeuronIds[0])
    const [selectedTrial, setSelectedTrial] = useState<number>(distinctTrialIds[0])
    useRecordingSelectionTimeInitialization(baseStartTime, baseEndTime)

    const margins = useTimeseriesMargins(timeseriesLayoutOpts)
    const { visibleTimeStartSeconds, visibleTimeEndSeconds } = useTimeRange()

    // Compute the per-panel pixel drawing area dimensions.
    const distinctNeuronCount = useMemo(() => distinctNeuronIds.length, [distinctNeuronIds])
    const distinctTrialCount = useMemo(() => distinctTrialIds.length, [distinctTrialIds])
    const toolbarWidth = timeseriesLayoutOpts?.hideToolbar ? 0 : DefaultToolbarWidth

    const { panelWidth, panelHeights: [perNeuronPanelHeight, perTrialPanelHeight] } = useMultiplePanelDimensions(
        width - toolbarWidth,
        heightExBottomControls,
        [distinctNeuronCount, distinctTrialCount],
        panelSpacings,
        margins)
    const pixelsPerSecond = usePixelsPerSecond(panelWidth, visibleTimeStartSeconds, visibleTimeEndSeconds)
    const timeToPixelMatrix = use1dTimeToPixelMatrix(pixelsPerSecond, visibleTimeStartSeconds)

    const panelHeight = useMemo(() => mode === 'slicing_by_neuron' ? perTrialPanelHeight : mode === 'slicing_by_trial' ? perNeuronPanelHeight : 0, [mode, perNeuronPanelHeight, perTrialPanelHeight])
    const tensorSlice = useTensorSlice(mode, mode === 'slicing_by_neuron' ? selectedNeuron : selectedTrial, spikeTensor)
    // Ideally this would be selecting among the different metadata series
    const spikeColorFunction = useMemo(() => {
        switch(colorSource) {
            case 0:
                return undefined
            case 1:
                return colorForSpikeIndex
        }
    }, [colorSource])
    const rasterData = usePixelPanels(tensorSlice, visibleTimeStartSeconds ?? baseStartTime, visibleTimeEndSeconds ?? baseEndTime, timeToPixelMatrix, panelHeight, spikeColorFunction)

    const panelSpacing = useMemo(() => mode === 'slicing_by_trial' ? panelSpacings[0] : panelSpacings[1], [mode])

    const plotData = useMemo(() => {
        return {
            plots: rasterData,
            width: width,
            height: heightExBottomControls,
            margins: margins,
            panelSpacing: panelSpacing,
            timeseriesLayoutOpts: timeseriesLayoutOpts,
            visibleTimeStartSeconds: visibleTimeStartSeconds
        }
    }, [heightExBottomControls, margins, panelSpacing, rasterData, timeseriesLayoutOpts, visibleTimeStartSeconds, width])
    
    return visibleTimeStartSeconds === undefined
    ? (<div>Loading...</div>)
    : (
        <>
            <TimeScrollView
                margins={margins}
                panels={plotData.plots}
                panelSpacing={panelSpacing}
                setSelectedPanelKeys={() => {}}
                timeseriesLayoutOpts={timeseriesLayoutOpts}
                width={width}
                height={heightExBottomControls}
            />
            <MultiTrialRasterControls
                mode={mode}
                colorMode={colorSource}
                selectedNeuron={selectedNeuron}
                selectedTrial={selectedTrial}
                distinctNeuronIds={distinctNeuronIds}
                distinctTrialIds={distinctTrialIds}
                setMode={setMode}
                setColorMode={setColorSource}
                setSelectedNeuron={setSelectedNeuron}
                setSelectedTrial={setSelectedTrial}
            />
        </>
    )
}

export default MultiTrialRaster