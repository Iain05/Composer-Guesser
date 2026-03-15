package org.composerguesser.backend.controller;

import org.composerguesser.backend.dto.ComposerSummaryDto;
import org.composerguesser.backend.model.Composer;
import org.composerguesser.backend.repository.ComposerRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/composers")
public class ComposerController {

    private final ComposerRepository composerRepository;

    public ComposerController(ComposerRepository composerRepository) {
        this.composerRepository = composerRepository;
    }

    @GetMapping
    public List<ComposerSummaryDto> getAllComposers() {
        return composerRepository.findAll().stream()
                .map(c -> new ComposerSummaryDto(c.getComposerId(), c.getFirstName(), c.getLastName()))
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Composer> getComposer(@PathVariable Long id) {
        return composerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
