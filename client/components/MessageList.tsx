import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react'
import { IBox, IMessage } from '../types/general';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Path, Text as SVGText } from 'react-native-svg';
import { Line } from '../types/sketchCanvas';


interface Props {
    selectedBox: IBox | null,
    messages: Record<string, IMessage[]>
}

const Months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
]



export const MessageList: React.FC<Props> = ({ selectedBox, messages }) => {
    if (!selectedBox) {
        return null
    }
    let selectedBoxMessages = messages[selectedBox.box];
    let msgs = selectedBoxMessages.map(({ data: { lines, texts }, seen, sentTime }, index) => (
        <View key={index} style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 40 }}>
            <View style={{ width: 320, height: 240 }}>
                <Svg style={{ backgroundColor: 'black', width: 320, height: 240 }}>
                    {lines.map((line, i) => createPath(line, i))}
                    {
                        texts.map((textData, i) => (
                            <SVGText
                                x={textData.pos[0]}
                                y={textData.fontSize + textData.pos[1]}
                                fontSize={textData.fontSize}
                                key={i}
                                fill={textData.color} >
                                {textData.text}
                            </SVGText>
                        ))
                    }
                </Svg>
                <View style={{ flexDirection: 'row', paddingHorizontal: 10 }}>
                    <Text style={{ flex: 1 }}>{seen ? 'Seen' : 'Not seen'}</Text>
                    <Text style={{ flex: 1, textAlign: 'right' }}>{`${Months[sentTime.getMonth()]} ${sentTime.getDate()}, ${sentTime.getFullYear()}`}</Text>
                </View>
            </View>
        </View>
    ))
    return (
        <ScrollView style={{ marginTop: 20 }}>
            {msgs}
        </ScrollView>
    )
}
function createPath(line: Line, index?: number) {
    let { points, lineWidth, color } = line;
    let d = `M ${points[0]} ${points[1]}`;
    for (let i = 2; i < points.length; i += 2) {
        d += ` L ${points[i]} ${points[i + 1]}`;
    }
    return (
        <Path
            key={index}
            d={d}
            strokeWidth={lineWidth}
            strokeLinecap="round"
            stroke={color}
        />
    )
}