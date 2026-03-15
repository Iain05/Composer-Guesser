package org.composerguesser.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "tbl_excerpt_day")
public class ExcerptDay {

    @Id
    @Column(nullable = false)
    private LocalDate date;

    @ManyToOne
    @JoinColumn(name = "excerpt_id", nullable = false)
    private Excerpt excerpt;

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public Excerpt getExcerpt() { return excerpt; }
    public void setExcerpt(Excerpt excerpt) { this.excerpt = excerpt; }
}
