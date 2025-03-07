export interface IncidentClassification {
  severity: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  priority: number;
  category: string;
  tags: string[];
}

export interface IncidentData {
  title: string;
  description: string;
  location: string;
  incident_type: string;
  time_sensitivity: number;
  population_density: number;
  vulnerability_index: number;
  weather_conditions?: string;
  infrastructure_impact?: string;
}

export class IncidentClassifier {
  private readonly SEVERITY_WEIGHTS = {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    EXTREME: 4,
  };

  private readonly TIME_SENSITIVITY_WEIGHT = 0.3;
  private readonly POPULATION_DENSITY_WEIGHT = 0.2;
  private readonly VULNERABILITY_WEIGHT = 0.2;
  private readonly INFRASTRUCTURE_WEIGHT = 0.15;
  private readonly WEATHER_WEIGHT = 0.15;

  public classifyIncident(incident: IncidentData): IncidentClassification {
    const severity = this.determineSeverity(incident);
    const priority = this.calculatePriority(incident, severity);
    const category = this.determineCategory(incident);
    const tags = this.generateTags(incident);

    return {
      severity,
      priority,
      category,
      tags,
    };
  }

  private determineSeverity(incident: IncidentData): 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME' {
    const score = this.calculateSeverityScore(incident);

    if (score >= 0.8) return 'EXTREME';
    if (score >= 0.6) return 'HIGH';
    if (score >= 0.4) return 'MODERATE';
    return 'LOW';
  }

  private calculateSeverityScore(incident: IncidentData): number {
    const timeScore = Math.min(incident.time_sensitivity / 24, 1);
    const populationScore = Math.min(incident.population_density / 1000, 1);
    const vulnerabilityScore = incident.vulnerability_index;
    const infrastructureScore = incident.infrastructure_impact ? 1 : 0;
    const weatherScore = incident.weather_conditions === 'SEVERE' ? 1 : 0;

    return (
      timeScore * this.TIME_SENSITIVITY_WEIGHT +
      populationScore * this.POPULATION_DENSITY_WEIGHT +
      vulnerabilityScore * this.VULNERABILITY_WEIGHT +
      infrastructureScore * this.INFRASTRUCTURE_WEIGHT +
      weatherScore * this.WEATHER_WEIGHT
    );
  }

  private calculatePriority(incident: IncidentData, severity: string): number {
    const severityWeight = this.SEVERITY_WEIGHTS[severity as keyof typeof this.SEVERITY_WEIGHTS];
    const timeWeight = Math.min(incident.time_sensitivity / 24, 1);
    const populationWeight = Math.min(incident.population_density / 1000, 1);
    const vulnerabilityWeight = incident.vulnerability_index;

    return (
      severityWeight * 0.4 +
      timeWeight * 0.3 +
      populationWeight * 0.2 +
      vulnerabilityWeight * 0.1
    );
  }

  private determineCategory(incident: IncidentData): string {
    const type = incident.incident_type.toLowerCase();
    
    if (type.includes('flood') || type.includes('water')) return 'WATER_EMERGENCY';
    if (type.includes('fire')) return 'FIRE_EMERGENCY';
    if (type.includes('medical')) return 'MEDICAL_EMERGENCY';
    if (type.includes('structural')) return 'STRUCTURAL_EMERGENCY';
    if (type.includes('evacuation')) return 'EVACUATION';
    return 'GENERAL_EMERGENCY';
  }

  private generateTags(incident: IncidentData): string[] {
    const tags: string[] = [];

    // Add severity-based tags
    tags.push(incident.severity.toLowerCase());

    // Add time sensitivity tags
    if (incident.time_sensitivity < 6) tags.push('urgent');
    if (incident.time_sensitivity < 12) tags.push('high-priority');
    if (incident.time_sensitivity < 24) tags.push('medium-priority');

    // Add population density tags
    if (incident.population_density > 800) tags.push('high-density');
    if (incident.population_density > 500) tags.push('medium-density');

    // Add vulnerability tags
    if (incident.vulnerability_index > 0.7) tags.push('high-vulnerability');
    if (incident.vulnerability_index > 0.5) tags.push('medium-vulnerability');

    // Add weather condition tags
    if (incident.weather_conditions === 'SEVERE') tags.push('severe-weather');

    // Add infrastructure impact tags
    if (incident.infrastructure_impact) tags.push('infrastructure-affected');

    return [...new Set(tags)]; // Remove duplicates
  }
} 