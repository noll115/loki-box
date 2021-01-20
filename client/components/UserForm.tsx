import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { StyleSheet, Text, View, TextInput, Animated } from 'react-native';
import validator from 'validator';


import Button from './Button';

export interface UserFormMethods {
    clearText(): void
}


interface Props {
    onSubmit: (email: string, pass: string) => void,
    error: string | null,
    disableSubmit?: boolean,
    formType: 'register' | 'login',
}


interface FormInput extends Record<string, string> {
    email: string,
    pass: string
};


const formHasEmptyInputs = (inputs: FormInput) => {
    for (const key in inputs) {
        if (!validator.isLength(inputs[key], { min: 1 }))
            return true;
    }
    return false;
}


const UserForm: React.ForwardRefRenderFunction<UserFormMethods, Props> = ({ onSubmit, error, disableSubmit, formType }, ref) => {
    let [formInputs, setFormInputs] = useState<FormInput>({
        email: '',
        pass: ''
    });
    let [invalidEmail, setInvalidEmail] = useState(false);
    let passText = useRef<TextInput | null>(null);
    let emailText = useRef<TextInput | null>(null);
    let btnTitle = formType === 'login' ? 'Sign In' : 'Register';

    useImperativeHandle(ref, () => ({
        clearText: () => {
            setFormInputs({ email: '', pass: '' });
        }
    }));


    const fadeAnim = useRef(new Animated.Value(0)).current;

    const fadeIn = () => {
        Animated.timing(fadeAnim, {
            useNativeDriver: true,
            toValue: 1,
            duration: 250
        }).start();
    }

    useEffect(() => {
        if (error !== null)
            fadeIn();
        else {
            fadeAnim.setValue(0);
        }
    }, [error])


    const updateFormState = (field: keyof FormInput) => {
        return (newInput: string) => {
            setFormInputs(prevState => ({ ...prevState, [field]: newInput }))
        }
    }

    const HandleSubmit = () => {
        passText.current?.blur();
        let validEmail = validator.isEmail(formInputs.email)
        if (!validEmail) {
            return setInvalidEmail(!validEmail);
        }
        if (formType === 'register' && validator.isLength(formInputs.pass, { min: 6, max: 15 }) && validator.isAlphanumeric(formInputs.pass)) {
            onSubmit(formInputs.email, formInputs.pass);
        } else {
            onSubmit(formInputs.email, formInputs.pass);
        }
    }


    return (
        <View >

            <View style={styles.input}>
                <Text style={styles.inputTitle}>Email</Text>
                <TextInput
                    ref={emailText}
                    style={styles.inputTextBox}
                    keyboardType='email-address'
                    textContentType='emailAddress'
                    autoFocus
                    autoCapitalize="none"
                    value={formInputs.email}
                    blurOnSubmit={false}
                    onChangeText={updateFormState('email')}
                    onSubmitEditing={() => {
                        if (formInputs.email !== '')
                            passText.current?.focus()
                        setInvalidEmail(!validator.isEmail(formInputs.email));
                    }}
                />
                {invalidEmail && <Text style={{ color: '#f25f5c', marginTop: 4 }}>Invalid email format</Text>}
            </View>
            <View style={[styles.input, styles.inputBottom]}>
                <Text style={styles.inputTitle}>Password</Text>
                <TextInput
                    ref={passText}
                    style={styles.inputTextBox}
                    secureTextEntry
                    textContentType='password'
                    value={formInputs.pass}
                    onChangeText={updateFormState('pass')}
                />
            </View>
            <Button title={btnTitle}
                btnStyle={styles.subBtn}
                onPress={HandleSubmit}
                isDisabled={formHasEmptyInputs(formInputs) || disableSubmit}
                enableShadow
            />
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        width: '100%',
        paddingVertical: 4
    },
    inputTextBox: {
        fontSize: 22,
        borderBottomColor: 'grey',
        borderBottomWidth: 1,
    },
    inputTitle: {
        fontWeight: 'bold',
        marginBottom: 7,
        fontSize: 15
    },
    inputBottom: {
        marginTop: 30
    },
    subBtn: {
        marginTop: 40
    }
})

export default forwardRef(UserForm);
