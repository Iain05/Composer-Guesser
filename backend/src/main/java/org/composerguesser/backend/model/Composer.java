package org.composerguesser.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "tbl_composer")
public class Composer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "composer_id")
    private Long composerId;

    @Column(name = "complete_name", nullable = false)
    private String completeName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "birth_year", nullable = false)
    private Integer birthYear;

    @Column(name = "death_year")
    private Integer deathYear;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Era era;

    @Column(nullable = false)
    private String nationality;

    public Long getComposerId() { return composerId; }
    public void setComposerId(Long composerId) { this.composerId = composerId; }

    public String getCompleteName() { return completeName; }
    public void setCompleteName(String completeName) { this.completeName = completeName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public Integer getBirthYear() { return birthYear; }
    public void setBirthYear(Integer birthYear) { this.birthYear = birthYear; }

    public Integer getDeathYear() { return deathYear; }
    public void setDeathYear(Integer deathYear) { this.deathYear = deathYear; }

    public Era getEra() { return era; }
    public void setEra(Era era) { this.era = era; }

    public String getNationality() { return nationality; }
    public void setNationality(String nationality) { this.nationality = nationality; }


}
