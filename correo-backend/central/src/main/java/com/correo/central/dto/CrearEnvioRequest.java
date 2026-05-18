package com.correo.central.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrearEnvioRequest {

    @NotBlank(message = "El remitente no puede estar vacío")
    private String remitente;

    @NotBlank(message = "El destinatario no puede estar vacío")
    private String destinatario;
}