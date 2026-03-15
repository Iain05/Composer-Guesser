package org.composerguesser.backend.repository;

import org.composerguesser.backend.model.Composer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComposerRepository extends JpaRepository<Composer, Long> {
}
