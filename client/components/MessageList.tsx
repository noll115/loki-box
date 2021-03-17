import { StatusBar, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useRef } from 'react'
import { IBox, IMessage } from '../types/general';
import { ScrollView } from 'react-native-gesture-handler';
import Svg, { Path, Text as SVGText } from 'react-native-svg';
import { Line, TextData } from '../types/sketchCanvas';
import { FontAwesome } from '@expo/vector-icons';




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
];


function createPaths(lines: Line[]) {
    return lines.map((line, i) => {
        let { points, lineWidth, color } = line;
        let d = `M ${points[0]} ${points[1]}`;
        for (let i = 2; i < points.length; i += 2) {
            d += ` L ${points[i]} ${points[i + 1]}`;
        }
        return (
            <Path
                key={i}
                d={d}
                strokeWidth={lineWidth}
                strokeLinecap="round"
                stroke={color}
            />
        )
    })
}

function createTexts(texts: TextData[]) {
    return texts.map((textData, i) => (
        <Text
            key={i}
            style={[style.text,
            {
                color: textData.color,
                fontSize: textData.txtSize,
                lineHeight: textData.txtSize,
                height: textData.txtSize + 2,
                position: 'absolute',
                transform: [{
                    translateX: textData.pos[0],
                }, {
                    translateY: textData.pos[1]
                }]
            }
            ]}
        >
            {textData.text}
        </Text>
    ));
}

interface Props {
    selectedBox: IBox | null,
    messages: Record<string, IMessage[]>
}


export const MessageList: React.FC<Props> = ({ selectedBox, messages }) => {
    if (!selectedBox) {
        return null;
    }
    let selectedBoxMessages = messages[selectedBox.box];
    const prevMessages = useRef<IMessage[]>(selectedBoxMessages);

    useEffect(() => {
        console.log(selectedBoxMessages.length);
        console.log(prevMessages.current.length);
        prevMessages.current = selectedBoxMessages;
    }, [selectedBoxMessages]);

    let msgs = selectedBoxMessages.map(({ data: { lines, texts }, seen, sentTime }, index) => (
        <View key={index} style={{ justifyContent: 'center', alignItems: 'center', marginBottom: 70 }}>
            <View style={{ width: 320, height: 240 }}>
                <Svg style={{ backgroundColor: 'black', width: 320, height: 240, borderRadius: 10 }}>
                    {createPaths(lines)}
                    {createTexts(texts)}
                </Svg>
                <View style={{ flexDirection: 'row', paddingHorizontal: 10, marginTop: 10 }}>
                    <View style={{ flex: 1, flexDirection: 'row' }}><FontAwesome style={{ marginRight: 10 }} name="heart" size={20} color={seen ? '#8C1C13' : '#FFCABE'} /><Text >{seen ? 'Seen' : 'Sent'}</Text></View>
                    <Text style={{ flex: 1, textAlign: 'right' }}>{`${Months[sentTime.getMonth()]} ${sentTime.getDate()}, ${sentTime.getFullYear()}`}</Text>
                </View>
            </View>
        </View>
    ))
    return (
        <ScrollView style={{ paddingTop: 20 }} >
            {msgs}
        </ScrollView>
    )
}

let style = StyleSheet.create({
    text: {
        textAlign: 'left',
        fontFamily: 'FreeSans'
    }
})