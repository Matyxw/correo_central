package com.correo.central.exception;

public class EnvioNotFoundException extends RuntimeException {
    public EnvioNotFoundException(String identificador) {
        super("Envío no encontrado: " + identificador);
    }
}