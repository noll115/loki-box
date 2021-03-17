import React, { useEffect, useState } from 'react'
import { Modal, StyleSheet, View, Text } from 'react-native';
import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import { BlurView } from 'expo-blur';
import Button from '../../Button';


interface Props {
    onScan: (box: ScannedBox) => void
    onClose: () => void,
    showCam: boolean
}


export interface ScannedBox {
    boxID: string
}



const QRScanner: React.FC<Props> = ({ onScan, showCam, onClose }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    useEffect(() => {
        setScanned(false);
        setHasPermission(false);
    }, [showCam])

    const handleOnShown = () => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted')
        })();
    }


    const handleBarCodeScan: BarCodeScannedCallback = ({ data }) => {
        const parseData: ScannedBox = JSON.parse(data);
        setScanned(true);
        onScan(parseData);
    }

    return (
        <BlurView tint='dark' intensity={50} style={styles.modalContainer}>
            <View style={styles.modal}>
                <View style={{ justifyContent: 'center', alignItems: 'center', flex: 0.15, width: '100%' }}>
                    <Text style={{ fontSize: 40 }}>Scan QR Code</Text>
                </View>
                <View style={{ height: '80%', width: '89%', flex: 0.8 }}>
                    {hasPermission &&
                        <BarCodeScanner
                            type='back'
                            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                            onBarCodeScanned={scanned ? undefined : handleBarCodeScan}
                            style={{ flex: 1 }}
                        />}
                </View>
                <Button title='Back' btnStyle={{ margin: 0, backgroundColor: 'transparent', flex: 0.1 }} onPress={onClose} />
            </View>
        </BlurView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    modal: {
        backgroundColor: '#FEF4EA',
        height: '75%',
        width: '90%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30
    }
})

export default QRScanner;