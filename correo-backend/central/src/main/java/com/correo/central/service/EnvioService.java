package com.correo.central.service;

import com.correo.central.dto.CrearEnvioRequest;
import com.correo.central.exception.EnvioNotFoundException;
import com.correo.central.exception.EstadoInvalidoException;
import com.correo.central.model.Envio;
import com.correo.central.repository.EnvioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class EnvioService {

    private final EnvioRepository repo;

    // Inyección por constructor: testeable, explícita, sin magia de @Autowired
    public EnvioService(EnvioRepository repo) {
        this.repo = repo;
    }

    public Page<Envio> obtenerTodos(Pageable pageable) {
        return repo.findAll(pageable);
    }

    public Envio obtenerPorTracking(String trackingNumber) {
        return repo.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new EnvioNotFoundException(trackingNumber));
    }

    public Envio crearEnvio(CrearEnvioRequest request) {
        Envio envio = new Envio();
        envio.setTrackingNumber(generarTracking());
        envio.setRemitente(request.getRemitente());
        envio.setDestinatario(request.getDestinatario());
        envio.setEstadoActual(Envio.EstadoEnvio.RECIBIDO);
        envio.getHistorial().add(new Envio.Evento("Envío registrado en el sistema", "Sistema Central"));
        return repo.save(envio);
    }

    public Envio actualizarEstado(String id, Envio.EstadoEnvio nuevoEstado) {
        Envio envio = repo.findById(id)
                .orElseThrow(() -> new EnvioNotFoundException(id));

        validarTransicion(envio.getEstadoActual(), nuevoEstado);

        envio.setEstadoActual(nuevoEstado);
        envio.getHistorial().add(
                new Envio.Evento("Estado actualizado a: " + nuevoEstado.name(), "Sistema Central")
        );
        return repo.save(envio);
    }

    public Envio cancelarEnvio(String id) {
        Envio envio = repo.findById(id)
                .orElseThrow(() -> new EnvioNotFoundException(id));

        if (envio.getEstadoActual() == Envio.EstadoEnvio.ENTREGADO) {
            throw new EstadoInvalidoException("No se puede cancelar un envío ya entregado.");
        }
        if (envio.getEstadoActual() == Envio.EstadoEnvio.CANCELADO) {
            throw new EstadoInvalidoException("El envío ya fue cancelado anteriormente.");
        }

        envio.setEstadoActual(Envio.EstadoEnvio.CANCELADO);
        envio.getHistorial().add(new Envio.Evento("Envío cancelado", "Sistema Central"));
        return repo.save(envio);
    }

    // Regla: no se puede modificar un estado terminal
    private void validarTransicion(Envio.EstadoEnvio actual, Envio.EstadoEnvio nuevo) {
        if (actual == Envio.EstadoEnvio.ENTREGADO || actual == Envio.EstadoEnvio.CANCELADO) {
            throw new EstadoInvalidoException(
                    "No se puede modificar un envío en estado: " + actual.name()
            );
        }
    }

    // El servidor controla el formato del tracking. El cliente no decide esto.
    private String generarTracking() {
        return "CL-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}