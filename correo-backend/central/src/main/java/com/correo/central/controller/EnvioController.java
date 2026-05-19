package com.correo.central.controller;

import com.correo.central.dto.ActualizarEstadoRequest;
import com.correo.central.dto.CrearEnvioRequest;
import com.correo.central.model.Envio;
import com.correo.central.service.EnvioService;
import com.correo.central.service.EnvioService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/envios")
@CrossOrigin(origins = "*")
public class EnvioController {

    private final EnvioService service;

    public EnvioController(EnvioService service) {
        this.service = service;
    }

    // Paginado obligatorio para proteger el rendimiento de la base de datos
    @GetMapping
    public Page<Envio> obtenerTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.obtenerTodos(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaCreacion"))
        );
    }

    @GetMapping("/{trackingNumber}")
    public ResponseEntity<Envio> obtenerPorTracking(@PathVariable String trackingNumber) {
        return ResponseEntity.ok(service.obtenerPorTracking(trackingNumber));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Envio crearEnvio(@Valid @RequestBody CrearEnvioRequest request) {
        return service.crearEnvio(request);
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<Envio> actualizarEstado(
            @PathVariable String id,
            @Valid @RequestBody ActualizarEstadoRequest request
    ) {
        return ResponseEntity.ok(service.actualizarEstado(id, request.getEstadoActual()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Envio> cancelarEnvio(@PathVariable String id) {
        return ResponseEntity.ok(service.cancelarEnvio(id));
    }
}