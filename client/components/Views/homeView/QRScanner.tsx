import React, { useContext, useEffect, useState } from 'react'
import { Modal, StyleSheet, View, Text, StatusBar, Pressable } from 'react-native';
import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import Button from '../../Button';
import { AddBoxViewStackProp, IContextProp, NewBoxContext } from '../addBoxView/addBoxViewNav';
import { Feather } from '@expo/vector-icons';
import { LoadingHeart } from '../../loadingHeart';





const QRScanner: React.FC<AddBoxViewStackProp<'qrScreen'>> = ({ navigation }) => {
    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [camSize, setCamSize] = useState(0);
    const { changeBoxInfo } = useContext(NewBoxContext) as IContextProp;

    const requestPermissions = async () => {
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        setHasPermission(status === 'granted');
        setLoaded(true);
    }

    useEffect(() => {
        let removeListener = navigation.addListener('transitionEnd', () => {
            requestPermissions();
        })
        return removeListener;
    }, [])


    const handleBarCodeScan: BarCodeScannedCallback = ({ data }) => {
        const ID = data;
        if (ID) {
            setScanned(true);
            changeBoxInfo({ boxID: ID });
            navigation.push('boxName');
        }
    }
    return (
        <View style={styles.modal}>
            <View style={{ flex: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                <Text style={{ fontSize: 30 }}>Scanning QR Code</Text>
            </View>

            <View style={{ alignItems: 'center', flex: 7 }} onLayout={({ nativeEvent: { layout } }) => setCamSize(layout.height * 0.8)}>
                {!loaded &&
                    <View style={{ justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <View style={{ paddingBottom: 80 }}>
                            <LoadingHeart />
                        </View>
                        <Text style={{ fontSize: 20 }}>Loading Camera</Text>
                    </View>
                }
                {loaded && hasPermission &&
                    <BarCodeScanner
                        type='back'
                        barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                        onBarCodeScanned={scanned ? undefined : handleBarCodeScan}
                        style={{ width: '90%', height: camSize }}
                    />
                }
                {
                    loaded && !hasPermission &&
                    <View style={{ flex: 1, paddingHorizontal: '4%', justifyContent: 'center', alignItems: 'center' }}>
                        <Feather name="camera-off" size={55} color="black" />
                        <Text style={{ fontSize: 25, textAlign: 'center', paddingVertical: 30 }}>Please give the app camera permissions.</Text>
                        <Button enableShadow onPress={requestPermissions} title={<Text>Give <Feather name="camera" size={24} color="black" /> Permissions.</Text>}></Button>
                    </View >
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        paddingTop: StatusBar.currentHeight,
    }
})

export default QRScanner;