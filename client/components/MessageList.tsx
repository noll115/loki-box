import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useState } from 'react'
import { IBox, IMessage } from '../types/general';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Path, Text as SVGText } from 'react-native-svg';


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
                    {
                        lines.map((line, i) => (
                            <Path
                                key={i}
                                d={'M' + line.points.map(p => `${p.x} ${p.y}`).join(' L ')}
                                strokeWidth={line.lineWidth}
                                strokeLinecap="round"
                                stroke={line.color}
                            />
                        ))
                    }
                    {
                        texts.map((textData, i) => (
                            <SVGText
                                x={textData.pos.x}
                                y={textData.fontSize + textData.pos.y}
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
