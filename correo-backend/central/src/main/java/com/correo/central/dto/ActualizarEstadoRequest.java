package com.correo.central.dto;

import com.correo.central.model.Envio;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ActualizarEstadoRequest {

    @NotNull(message = "El estado no puede ser nulo")
    private Envio.EstadoEnvio estadoActual;
}