import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { RootState } from '../../../redux'
import { BarCodeEvent, BarCodeScanner } from 'expo-barcode-scanner';
import * as permissions from 'expo-permissions'


const mapState = (state: RootState) => ({
    socketState: state.socket
})

const mapDispatch = {

}

const connector = connect(mapState, mapDispatch);

type Props = ConnectedProps<typeof connector>




const QRScanner: React.FC<Props> = ({ socketState }) => {

    const [hasPermission, setHasPermission] = useState(false);
    const [scanned, setScanned] = useState(false);
    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted')
        })();
    }, [])


    return (
        <View style={styles.container}>
            <BarCodeScanner
                type='back'
                barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                onBarCodeScanned={(res: BarCodeEvent) => {
                    console.log(res);
                    setScanned(true);
                }}
                style={{ width: '100%', height: '100%' }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%'
    }
})

export default connector(QRScanner);