import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-registo',
  templateUrl: './registo.component.html',
  styleUrls: ['./registo.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class RegistoComponent {
  registoForm: FormGroup;
  errors: any = {};
  files: any = {};
  metodosSelecionados: string[] = [];
  passwordStrength = { percent: 0, color: 'red', message: 'Muito Fraca' };
  passwordVisible = false;
  confirmPasswordVisible = false;
  passwordMismatch = false;

  metodosPagamento: string[] = [
    'Dinheiro',
    'MB Way',
    'Cartão de Crédito/Débito',
    'Multibanco',
    'Outro',
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
  ) {
    this.registoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      role: ['', Validators.required],
      clienteTelemovel: ['', [Validators.pattern(/^\d{9}$/)]],
      clienteNif: ['', [Validators.pattern(/^\d{9}$/)]],
      address: [''],
      managerTelemovel: ['', [Validators.pattern(/^\d{9}$/)]],
    });

     this.registoForm.valueChanges.subscribe(() => {
      this.checkPasswordMismatch();
    });
  }

  checkPasswordMismatch(): void {
    const password = this.registoForm.get('password')?.value;
    const confirmPassword = this.registoForm.get('confirmPassword')?.value;
    this.passwordMismatch = password !== confirmPassword;
  }

  // Método para lidar com a mudança de tipo de conta
onRoleChange(): void {
  const role = this.registoForm.get('role')?.value;

  if (role === 'Client') {
    // Configura validações para os campos de cliente
    this.registoForm.get('clienteTelemovel')?.setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
    this.registoForm.get('clienteNif')?.setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
    this.registoForm.get('address')?.setValidators([Validators.required]);
  } else if (role === 'Manager') {
    // Configura validações para os campos de gerente
    this.registoForm.get('managerTelemovel')?.setValidators([Validators.required, Validators.pattern(/^\d{9}$/)]);
  }

  // Atualiza os estados de validação
  this.registoForm.get('clienteTelemovel')?.updateValueAndValidity();
  this.registoForm.get('clienteNif')?.updateValueAndValidity();
  this.registoForm.get('address')?.updateValueAndValidity();
  this.registoForm.get('managerTelemovel')?.updateValueAndValidity();
}
  clearClienteFields() {
    this.registoForm.patchValue({
      clienteTelemovel: '',
      clienteNif: '',
      address: '',
    });
  }

  clearRestauranteFields() {
    this.registoForm.patchValue({
      managerTelemovel: '',
    });
    this.files = {};
    this.metodosSelecionados = [];
  }

  onFileChange(event: any, field: string) {
    if (event.target.files.length > 0) {
      this.files[field] = event.target.files[0];
    }
  }

  onPagamentoChange(event: any) {
    const valor = event.target.value;
    if (event.target.checked) {
      this.metodosSelecionados.push(valor);
    } else {
      this.metodosSelecionados = this.metodosSelecionados.filter(v => v !== valor);
    }
  }

  onPasswordInput(): void {
    const password = this.registoForm.get('password')?.value || '';
    this.passwordStrength = this.calculatePasswordStrength(password);
  }

  calculatePasswordStrength(password: string): { percent: number; color: string; message: string } {
    let score = 0;

    // Incrementa o score com base nos critérios
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    // Define a força com base no score
    switch (score) {
      case 0:
      case 1:
        return { percent: 20, color: 'red', message: 'Very Weak' };
      case 2:
        return { percent: 40, color: 'orange', message: 'Weak' };
      case 3:
        return { percent: 60, color: 'yellow', message: 'Moderate' };
      case 4:
        return { percent: 80, color: 'lightgreen', message: 'Strong' };
      case 5:
        return { percent: 100, color: 'green', message: 'Very Strong' };
      default:
        return { percent: 0, color: 'red', message: 'Very Weak' };
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
    const passwordField = document.getElementById('password') as HTMLInputElement;
    passwordField.type = this.passwordVisible ? 'text' : 'password';
  }

  toggleConfirmPasswordVisibility(): void {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
    const confirmPasswordField = document.getElementById('confirmPassword') as HTMLInputElement;
    confirmPasswordField.type = this.confirmPasswordVisible ? 'text' : 'password';
  }

  onSubmit() {
    this.errors = {};

    const tipo = this.registoForm.get('tipo')?.value;

    if (tipo === 'Client') {
      // Apaga os campos de restaurante do objeto
      [
        'managerTelemovel',
      ].forEach(campo => this.registoForm.get(campo)?.setValue(undefined));
    }

    if (tipo === 'restaurante') {
      [
        'clienteTelemovel',
        'clienteNif',
        'address',
      ].forEach(campo => this.registoForm.get(campo)?.setValue(undefined));
    }

    if (this.registoForm.invalid) {
      this.registoForm.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Campos obrigatórios',
        text: 'Por favor preenche todos os campos obrigatórios.',
      });
      return;
    }

    if (this.registoForm.get('password')?.value !== this.registoForm.get('confirmPassword')?.value) {
      Swal.fire({
        icon: 'error',
        title: 'Erro na senha',
        text: 'As senhas não coincidem. Por favor, verifica novamente.',
      });
      return;
    }

    const formData = new FormData();

    Object.entries(this.registoForm.value).forEach(([key, valor]) => {
      // Garante que só tipos válidos são enviados
      if (
        typeof valor === 'string' && valor.trim() !== ''
      ) {
        formData.append(key, valor.trim());
      } else if (
        typeof valor === 'number' && !isNaN(valor)
      ) {
        formData.append(key, valor.toString());
      }
    });

    for (const key in this.files) {
      formData.append(key, this.files[key]);
    }

    this.metodosSelecionados.forEach(metodo => {
      formData.append('metodosPagamento[]', metodo);
    });

    this.http.post('http://localhost:3000/api/auth/registar', formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Conta criada com sucesso!',
          text: 'Redirecionando para o login...',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        }).then(() => {
          this.registoForm.reset();
          this.files = {};
          this.metodosSelecionados = [];
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.errors = err.error?.erros || { geral: 'Erro inesperado ao criar conta.' };
        Swal.fire({
          icon: 'error',
          title: 'Erro no registo',
          text: 'Verifica os dados e tenta novamente.',
        });
      }
    });
  }
}
