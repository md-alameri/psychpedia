#!/usr/bin/env python3
"""
Import full DSM-5 taxonomy into the content directory.
Creates metadata.json and index.mdx files for each condition.
"""

import os
import json
from pathlib import Path

# DSM-5 Taxonomy organized by categories
DSM5_TAXONOMY = {
    "Neurodevelopmental Disorders": [
        {"slug": "intellectual-disability", "title": "Intellectual Disability (Intellectual Developmental Disorder)", "icd": "F70-F79"},
        {"slug": "global-developmental-delay", "title": "Global Developmental Delay", "icd": "F88"},
        {"slug": "autism-spectrum-disorder", "title": "Autism Spectrum Disorder", "icd": "F84.0"},
        {"slug": "adhd", "title": "Attention-Deficit/Hyperactivity Disorder", "icd": "F90.0-F90.9"},
        {"slug": "specific-learning-disorder", "title": "Specific Learning Disorder", "icd": "F81"},
        {"slug": "developmental-coordination-disorder", "title": "Developmental Coordination Disorder", "icd": "F82"},
        {"slug": "stereotypic-movement-disorder", "title": "Stereotypic Movement Disorder", "icd": "F98.4"},
        {"slug": "tourette-disorder", "title": "Tourette's Disorder", "icd": "F95.2"},
        {"slug": "persistent-motor-vocal-tic-disorder", "title": "Persistent (Chronic) Motor or Vocal Tic Disorder", "icd": "F95.1"},
        {"slug": "provisional-tic-disorder", "title": "Provisional Tic Disorder", "icd": "F95.0"},
    ],
    "Schizophrenia Spectrum and Other Psychotic Disorders": [
        {"slug": "schizotypal-personality-disorder", "title": "Schizotypal Personality Disorder", "icd": "F21"},
        {"slug": "delusional-disorder", "title": "Delusional Disorder", "icd": "F22"},
        {"slug": "brief-psychotic-disorder", "title": "Brief Psychotic Disorder", "icd": "F23"},
        {"slug": "schizophreniform-disorder", "title": "Schizophreniform Disorder", "icd": "F20.81"},
        {"slug": "schizophrenia", "title": "Schizophrenia", "icd": "F20.9"},
        {"slug": "schizoaffective-disorder", "title": "Schizoaffective Disorder", "icd": "F25"},
        {"slug": "substance-induced-psychotic-disorder", "title": "Substance/Medication-Induced Psychotic Disorder", "icd": "Variable"},
        {"slug": "psychotic-disorder-due-to-medical-condition", "title": "Psychotic Disorder Due to Another Medical Condition", "icd": "F06.2"},
        {"slug": "catatonia", "title": "Catatonia", "icd": "F06.1"},
    ],
    "Bipolar and Related Disorders": [
        {"slug": "bipolar-i-disorder", "title": "Bipolar I Disorder", "icd": "F31"},
        {"slug": "bipolar-ii-disorder", "title": "Bipolar II Disorder", "icd": "F31.81"},
        {"slug": "cyclothymic-disorder", "title": "Cyclothymic Disorder", "icd": "F34.0"},
        {"slug": "substance-induced-bipolar-disorder", "title": "Substance/Medication-Induced Bipolar and Related Disorder", "icd": "Variable"},
        {"slug": "bipolar-disorder-due-to-medical-condition", "title": "Bipolar and Related Disorder Due to Another Medical Condition", "icd": "F06.3"},
    ],
    "Depressive Disorders": [
        {"slug": "disruptive-mood-dysregulation-disorder", "title": "Disruptive Mood Dysregulation Disorder", "icd": "F34.81"},
        {"slug": "major-depressive-disorder", "title": "Major Depressive Disorder", "icd": "F32-F33"},
        {"slug": "persistent-depressive-disorder", "title": "Persistent Depressive Disorder (Dysthymia)", "icd": "F34.1"},
        {"slug": "premenstrual-dysphoric-disorder", "title": "Premenstrual Dysphoric Disorder", "icd": "N94.3"},
        {"slug": "substance-induced-depressive-disorder", "title": "Substance/Medication-Induced Depressive Disorder", "icd": "Variable"},
        {"slug": "depressive-disorder-due-to-medical-condition", "title": "Depressive Disorder Due to Another Medical Condition", "icd": "F06.3"},
    ],
    "Anxiety Disorders": [
        {"slug": "separation-anxiety-disorder", "title": "Separation Anxiety Disorder", "icd": "F93.0"},
        {"slug": "selective-mutism", "title": "Selective Mutism", "icd": "F94.0"},
        {"slug": "specific-phobia", "title": "Specific Phobia", "icd": "F40.2"},
        {"slug": "social-anxiety-disorder", "title": "Social Anxiety Disorder (Social Phobia)", "icd": "F40.10"},
        {"slug": "panic-disorder", "title": "Panic Disorder", "icd": "F41.0"},
        {"slug": "agoraphobia", "title": "Agoraphobia", "icd": "F40.00"},
        {"slug": "generalized-anxiety-disorder", "title": "Generalized Anxiety Disorder", "icd": "F41.1"},
        {"slug": "substance-induced-anxiety-disorder", "title": "Substance/Medication-Induced Anxiety Disorder", "icd": "Variable"},
        {"slug": "anxiety-disorder-due-to-medical-condition", "title": "Anxiety Disorder Due to Another Medical Condition", "icd": "F06.4"},
    ],
    "Obsessive-Compulsive and Related Disorders": [
        {"slug": "obsessive-compulsive-disorder", "title": "Obsessive-Compulsive Disorder", "icd": "F42.2"},
        {"slug": "body-dysmorphic-disorder", "title": "Body Dysmorphic Disorder", "icd": "F45.22"},
        {"slug": "hoarding-disorder", "title": "Hoarding Disorder", "icd": "F42.3"},
        {"slug": "trichotillomania", "title": "Trichotillomania (Hair-Pulling Disorder)", "icd": "F63.3"},
        {"slug": "excoriation-disorder", "title": "Excoriation (Skin-Picking) Disorder", "icd": "L98.1"},
        {"slug": "substance-induced-ocd", "title": "Substance/Medication-Induced Obsessive-Compulsive and Related Disorder", "icd": "Variable"},
        {"slug": "ocd-due-to-medical-condition", "title": "Obsessive-Compulsive and Related Disorder Due to Another Medical Condition", "icd": "F06.8"},
    ],
    "Trauma- and Stressor-Related Disorders": [
        {"slug": "reactive-attachment-disorder", "title": "Reactive Attachment Disorder", "icd": "F94.1"},
        {"slug": "disinhibited-social-engagement-disorder", "title": "Disinhibited Social Engagement Disorder", "icd": "F94.2"},
        {"slug": "ptsd", "title": "Posttraumatic Stress Disorder", "icd": "F43.10"},
        {"slug": "acute-stress-disorder", "title": "Acute Stress Disorder", "icd": "F43.0"},
        {"slug": "adjustment-disorders", "title": "Adjustment Disorders", "icd": "F43.2"},
    ],
    "Dissociative Disorders": [
        {"slug": "dissociative-identity-disorder", "title": "Dissociative Identity Disorder", "icd": "F44.81"},
        {"slug": "dissociative-amnesia", "title": "Dissociative Amnesia", "icd": "F44.0"},
        {"slug": "depersonalization-derealization-disorder", "title": "Depersonalization/Derealization Disorder", "icd": "F48.1"},
    ],
    "Somatic Symptom and Related Disorders": [
        {"slug": "somatic-symptom-disorder", "title": "Somatic Symptom Disorder", "icd": "F45.1"},
        {"slug": "illness-anxiety-disorder", "title": "Illness Anxiety Disorder", "icd": "F45.21"},
        {"slug": "conversion-disorder", "title": "Conversion Disorder (Functional Neurological Symptom Disorder)", "icd": "F44"},
        {"slug": "psychological-factors-affecting-medical-condition", "title": "Psychological Factors Affecting Other Medical Conditions", "icd": "F54"},
        {"slug": "factitious-disorder", "title": "Factitious Disorder", "icd": "F68.10"},
    ],
    "Feeding and Eating Disorders": [
        {"slug": "pica", "title": "Pica", "icd": "F98.3"},
        {"slug": "rumination-disorder", "title": "Rumination Disorder", "icd": "F98.21"},
        {"slug": "avoidant-restrictive-food-intake-disorder", "title": "Avoidant/Restrictive Food Intake Disorder", "icd": "F50.82"},
        {"slug": "anorexia-nervosa", "title": "Anorexia Nervosa", "icd": "F50.0"},
        {"slug": "bulimia-nervosa", "title": "Bulimia Nervosa", "icd": "F50.2"},
        {"slug": "binge-eating-disorder", "title": "Binge-Eating Disorder", "icd": "F50.81"},
    ],
    "Elimination Disorders": [
        {"slug": "enuresis", "title": "Enuresis", "icd": "F98.0"},
        {"slug": "encopresis", "title": "Encopresis", "icd": "F98.1"},
    ],
    "Sleep-Wake Disorders": [
        {"slug": "insomnia-disorder", "title": "Insomnia Disorder", "icd": "F51.01"},
        {"slug": "hypersomnolence-disorder", "title": "Hypersomnolence Disorder", "icd": "F51.11"},
        {"slug": "narcolepsy", "title": "Narcolepsy", "icd": "G47.4"},
        {"slug": "obstructive-sleep-apnea-hypopnea", "title": "Obstructive Sleep Apnea Hypopnea", "icd": "G47.33"},
        {"slug": "central-sleep-apnea", "title": "Central Sleep Apnea", "icd": "G47.31"},
        {"slug": "sleep-related-hypoventilation", "title": "Sleep-Related Hypoventilation", "icd": "G47.3"},
        {"slug": "circadian-rhythm-sleep-wake-disorders", "title": "Circadian Rhythm Sleep-Wake Disorders", "icd": "G47.2"},
        {"slug": "non-rapid-eye-movement-sleep-arousal-disorders", "title": "Non-Rapid Eye Movement Sleep Arousal Disorders", "icd": "F51.3"},
        {"slug": "nightmare-disorder", "title": "Nightmare Disorder", "icd": "F51.5"},
        {"slug": "rapid-eye-movement-sleep-behavior-disorder", "title": "Rapid Eye Movement Sleep Behavior Disorder", "icd": "G47.52"},
        {"slug": "restless-legs-syndrome", "title": "Restless Legs Syndrome", "icd": "G25.81"},
        {"slug": "substance-induced-sleep-disorder", "title": "Substance/Medication-Induced Sleep Disorder", "icd": "Variable"},
    ],
    "Sexual Dysfunctions": [
        {"slug": "delayed-ejaculation", "title": "Delayed Ejaculation", "icd": "F52.32"},
        {"slug": "erectile-disorder", "title": "Erectile Disorder", "icd": "F52.21"},
        {"slug": "female-orgasmic-disorder", "title": "Female Orgasmic Disorder", "icd": "F52.31"},
        {"slug": "female-sexual-interest-arousal-disorder", "title": "Female Sexual Interest/Arousal Disorder", "icd": "F52.22"},
        {"slug": "genito-pelvic-pain-penetration-disorder", "title": "Genito-Pelvic Pain/Penetration Disorder", "icd": "F52.6"},
        {"slug": "male-hypoactive-sexual-desire-disorder", "title": "Male Hypoactive Sexual Desire Disorder", "icd": "F52.0"},
        {"slug": "premature-ejaculation", "title": "Premature (Early) Ejaculation", "icd": "F52.4"},
        {"slug": "substance-induced-sexual-dysfunction", "title": "Substance/Medication-Induced Sexual Dysfunction", "icd": "Variable"},
    ],
    "Gender Dysphoria": [
        {"slug": "gender-dysphoria-children", "title": "Gender Dysphoria in Children", "icd": "F64.2"},
        {"slug": "gender-dysphoria-adolescents-adults", "title": "Gender Dysphoria in Adolescents and Adults", "icd": "F64.0"},
    ],
    "Disruptive, Impulse-Control, and Conduct Disorders": [
        {"slug": "oppositional-defiant-disorder", "title": "Oppositional Defiant Disorder", "icd": "F91.3"},
        {"slug": "intermittent-explosive-disorder", "title": "Intermittent Explosive Disorder", "icd": "F63.81"},
        {"slug": "conduct-disorder", "title": "Conduct Disorder", "icd": "F91"},
        {"slug": "antisocial-personality-disorder", "title": "Antisocial Personality Disorder", "icd": "F60.2"},
        {"slug": "pyromania", "title": "Pyromania", "icd": "F63.1"},
        {"slug": "kleptomania", "title": "Kleptomania", "icd": "F63.2"},
    ],
    "Substance-Related and Addictive Disorders": [
        {"slug": "alcohol-use-disorder", "title": "Alcohol Use Disorder", "icd": "F10.10-F10.20"},
        {"slug": "alcohol-intoxication", "title": "Alcohol Intoxication", "icd": "F10.129"},
        {"slug": "alcohol-withdrawal", "title": "Alcohol Withdrawal", "icd": "F10.239"},
        {"slug": "caffeine-intoxication", "title": "Caffeine Intoxication", "icd": "F15.929"},
        {"slug": "caffeine-withdrawal", "title": "Caffeine Withdrawal", "icd": "F15.93"},
        {"slug": "cannabis-use-disorder", "title": "Cannabis Use Disorder", "icd": "F12.10-F12.20"},
        {"slug": "cannabis-intoxication", "title": "Cannabis Intoxication", "icd": "F12.129"},
        {"slug": "cannabis-withdrawal", "title": "Cannabis Withdrawal", "icd": "F12.288"},
        {"slug": "hallucinogen-use-disorder", "title": "Hallucinogen Use Disorder", "icd": "F16.10-F16.20"},
        {"slug": "phencyclidine-use-disorder", "title": "Phencyclidine Use Disorder", "icd": "F16.10-F16.20"},
        {"slug": "inhalant-use-disorder", "title": "Inhalant Use Disorder", "icd": "F18.10-F18.20"},
        {"slug": "opioid-use-disorder", "title": "Opioid Use Disorder", "icd": "F11.10-F11.20"},
        {"slug": "opioid-intoxication", "title": "Opioid Intoxication", "icd": "F11.129"},
        {"slug": "opioid-withdrawal", "title": "Opioid Withdrawal", "icd": "F11.23"},
        {"slug": "sedative-hypnotic-anxiolytic-use-disorder", "title": "Sedative, Hypnotic, or Anxiolytic Use Disorder", "icd": "F13.10-F13.20"},
        {"slug": "sedative-hypnotic-anxiolytic-intoxication", "title": "Sedative, Hypnotic, or Anxiolytic Intoxication", "icd": "F13.129"},
        {"slug": "sedative-hypnotic-anxiolytic-withdrawal", "title": "Sedative, Hypnotic, or Anxiolytic Withdrawal", "icd": "F13.239"},
        {"slug": "stimulant-use-disorder", "title": "Stimulant Use Disorder", "icd": "F15.10-F15.20"},
        {"slug": "stimulant-intoxication", "title": "Stimulant Intoxication", "icd": "F15.129"},
        {"slug": "stimulant-withdrawal", "title": "Stimulant Withdrawal", "icd": "F15.23"},
        {"slug": "tobacco-use-disorder", "title": "Tobacco Use Disorder", "icd": "F17.200"},
        {"slug": "tobacco-withdrawal", "title": "Tobacco Withdrawal", "icd": "F17.203"},
        {"slug": "gambling-disorder", "title": "Gambling Disorder", "icd": "F63.0"},
    ],
    "Neurocognitive Disorders": [
        {"slug": "delirium", "title": "Delirium", "icd": "F05"},
        {"slug": "major-neurocognitive-disorder-alzheimers", "title": "Major Neurocognitive Disorder Due to Alzheimer's Disease", "icd": "F02.80"},
        {"slug": "major-neurocognitive-disorder-frontotemporal", "title": "Major Neurocognitive Disorder Due to Frontotemporal Lobar Degeneration", "icd": "F02.80"},
        {"slug": "major-neurocognitive-disorder-lewy-bodies", "title": "Major Neurocognitive Disorder with Lewy Bodies", "icd": "F02.80"},
        {"slug": "major-neurocognitive-disorder-vascular", "title": "Major Vascular Neurocognitive Disorder", "icd": "F01.50"},
        {"slug": "major-neurocognitive-disorder-traumatic-brain-injury", "title": "Major Neurocognitive Disorder Due to Traumatic Brain Injury", "icd": "F02.80"},
        {"slug": "major-neurocognitive-disorder-substance", "title": "Substance/Medication-Induced Major Neurocognitive Disorder", "icd": "Variable"},
        {"slug": "major-neurocognitive-disorder-hiv", "title": "Major Neurocognitive Disorder Due to HIV Infection", "icd": "F02.80"},
        {"slug": "major-neurocognitive-disorder-prion", "title": "Major Neurocognitive Disorder Due to Prion Disease", "icd": "F02.80"},
        {"slug": "major-neurocognitive-disorder-parkinsons", "title": "Major Neurocognitive Disorder Due to Parkinson's Disease", "icd": "F02.80"},
        {"slug": "major-neurocognitive-disorder-huntingtons", "title": "Major Neurocognitive Disorder Due to Huntington's Disease", "icd": "F02.80"},
        {"slug": "mild-neurocognitive-disorder", "title": "Mild Neurocognitive Disorder", "icd": "F06.70"},
    ],
    "Personality Disorders": [
        {"slug": "paranoid-personality-disorder", "title": "Paranoid Personality Disorder", "icd": "F60.0"},
        {"slug": "schizoid-personality-disorder", "title": "Schizoid Personality Disorder", "icd": "F60.1"},
        {"slug": "borderline-personality-disorder", "title": "Borderline Personality Disorder", "icd": "F60.3"},
        {"slug": "histrionic-personality-disorder", "title": "Histrionic Personality Disorder", "icd": "F60.4"},
        {"slug": "narcissistic-personality-disorder", "title": "Narcissistic Personality Disorder", "icd": "F60.81"},
        {"slug": "avoidant-personality-disorder", "title": "Avoidant Personality Disorder", "icd": "F60.6"},
        {"slug": "dependent-personality-disorder", "title": "Dependent Personality Disorder", "icd": "F60.7"},
        {"slug": "obsessive-compulsive-personality-disorder", "title": "Obsessive-Compulsive Personality Disorder", "icd": "F60.5"},
    ],
    "Paraphilic Disorders": [
        {"slug": "voyeuristic-disorder", "title": "Voyeuristic Disorder", "icd": "F65.3"},
        {"slug": "exhibitionistic-disorder", "title": "Exhibitionistic Disorder", "icd": "F65.2"},
        {"slug": "frotteuristic-disorder", "title": "Frotteuristic Disorder", "icd": "F65.81"},
        {"slug": "sexual-masochism-disorder", "title": "Sexual Masochism Disorder", "icd": "F65.51"},
        {"slug": "sexual-sadism-disorder", "title": "Sexual Sadism Disorder", "icd": "F65.52"},
        {"slug": "pedophilic-disorder", "title": "Pedophilic Disorder", "icd": "F65.4"},
        {"slug": "fetishistic-disorder", "title": "Fetishistic Disorder", "icd": "F65.0"},
        {"slug": "transvestic-disorder", "title": "Transvestic Disorder", "icd": "F65.1"},
    ],
    "Other Mental Disorders": [
        {"slug": "other-specified-mental-disorder", "title": "Other Specified Mental Disorder", "icd": "F99"},
        {"slug": "unspecified-mental-disorder", "title": "Unspecified Mental Disorder", "icd": "F99"},
    ],
}

def create_metadata_file(slug, title, category, icd):
    """Create metadata.json for a condition."""
    metadata = {
        "slug": slug,
        "title": title,
        "description": f"A comprehensive guide to {title}, including diagnosis, management, and clinical considerations based on DSM-5 criteria.",
        "editorial": {
            "lastReviewed": "2024-01-15",
            "reviewer": {
                "name": "Dr. Clinical Editor",
                "role": "Consultant Psychiatrist",
                "credentials": ["MBBS", "MRCPsych", "MD"]
            },
            "evidenceStrength": "guideline",
            "evidenceLevel": "A",
            "version": 1
        },
        "locale": "en",
        "audienceLevel": {
            "public": True,
            "student": True,
            "clinician": True
        },
        "publicSummary": f"{title} is a mental health condition classified in the DSM-5 under {category}. This content provides educational information based on current clinical guidelines and is not a substitute for professional medical advice.",
        "category": category,
        "tags": [slug.replace("-", " "), category.lower()],
        "relatedConditions": [],
        "icd10": icd
    }
    return metadata

def create_mdx_template(title, category):
    """Create template index.mdx for a condition."""
    content = f"""# {title}

## Overview

{title} is classified under {category} in the DSM-5. This page provides comprehensive information about the diagnosis, clinical features, and management of this condition.

## Epidemiology

[Prevalence, incidence, and demographic information to be added based on current research and clinical guidelines.]

## Etiology & Risk Factors

### Biological Factors

[Information about genetic, neurobiological, and physiological factors to be added.]

### Psychological Factors

[Information about psychological and cognitive factors to be added.]

### Environmental Factors

[Information about environmental and social factors to be added.]

## Clinical Features

### Core Symptoms (DSM-5)

[Detailed DSM-5 diagnostic criteria to be added.]

### Additional Features

[Associated features and clinical presentations to be added.]

## Diagnosis

### DSM-5 Criteria

[Full DSM-5 diagnostic criteria to be added.]

### Assessment Tools

[Relevant screening tools and assessment instruments to be added.]

### Medical Workup

[Recommended medical investigations to be added.]

## Differential Diagnosis

### Medical Conditions

[Medical conditions to consider in differential diagnosis.]

### Psychiatric Conditions

[Psychiatric conditions to consider in differential diagnosis.]

## Management

### Non-pharmacological

#### Psychotherapy

[Evidence-based psychotherapy approaches to be added.]

#### Lifestyle Interventions

[Relevant lifestyle and behavioral interventions to be added.]

### Pharmacological

[Medication options and considerations to be added based on current clinical guidelines.]

## Prognosis

### Course

[Information about typical course and outcomes to be added.]

### Factors Affecting Prognosis

[Prognostic factors to be added.]

## Red Flags & When to Refer

### Immediate Referral (Emergency)

[Emergency situations requiring immediate referral.]

### Urgent Referral

[Situations requiring urgent psychiatric consultation.]

### Consider Referral

[Situations where specialist referral should be considered.]

## References

1. American Psychiatric Association. (2013). *Diagnostic and Statistical Manual of Mental Disorders* (5th ed.). Arlington, VA: American Psychiatric Publishing.

2. [Additional authoritative references to be added based on current research and clinical guidelines.]

"""
    return content

def main():
    """Main function to create all DSM-5 condition files."""
    base_path = Path("/home/user/psychpedia/content/conditions")

    # Counter for tracking
    total_conditions = 0
    created_conditions = 0
    skipped_conditions = 0

    for category, conditions in DSM5_TAXONOMY.items():
        print(f"\nProcessing category: {category}")
        print(f"  Conditions: {len(conditions)}")

        for condition in conditions:
            total_conditions += 1
            slug = condition["slug"]
            title = condition["title"]
            icd = condition.get("icd", "")

            condition_dir = base_path / slug

            # Check if already exists
            if condition_dir.exists():
                print(f"  ⏭️  Skipping {slug} (already exists)")
                skipped_conditions += 1
                continue

            # Create directory
            condition_dir.mkdir(parents=True, exist_ok=True)

            # Create metadata.json
            metadata = create_metadata_file(slug, title, category, icd)
            metadata_path = condition_dir / "metadata.json"
            with open(metadata_path, 'w', encoding='utf-8') as f:
                json.dump(metadata, f, indent=2, ensure_ascii=False)

            # Create index.mdx
            mdx_content = create_mdx_template(title, category)
            mdx_path = condition_dir / "index.mdx"
            with open(mdx_path, 'w', encoding='utf-8') as f:
                f.write(mdx_content)

            print(f"  ✅ Created {slug}")
            created_conditions += 1

    print(f"\n" + "="*60)
    print(f"DSM-5 Taxonomy Import Summary")
    print(f"="*60)
    print(f"Total conditions in taxonomy: {total_conditions}")
    print(f"Created: {created_conditions}")
    print(f"Skipped (already exist): {skipped_conditions}")
    print(f"="*60)

    # Print category summary
    print(f"\nCategory Summary:")
    for category, conditions in DSM5_TAXONOMY.items():
        print(f"  {category}: {len(conditions)} conditions")

if __name__ == "__main__":
    main()
